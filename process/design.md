# Design – Ping Me Maybe

> **Phase 3 output.** Data model, interfaces and pipeline for the MVP in `scope.md`.
> All timestamps: Europe/Budapest, `YYYY-MM-DD HH:mm`.
> **Accepted:** 2026-10-19 17:26 (prompt #7). Deviations from earlier ADRs/assumptions are recorded in ADR-013.
> **Updated:** 2026-10-19 17:53 – matcher: any keyword (ADR-014); rules `createdAt`/`userId` constraints; Reddit content count corrected (prompt #8).

## 1. Firestore collections

**`sources/{sourceId}`** – runtime state only; definitions (URL, fixture, adapter) live in code (ADR-013).
ID: fixed slug (`bbc-world`, `bbc-business`, `reddit-nottheonion`). The poller upserts it with `merge`, no seeding.

| field | type |
|---|---|
| name | string |
| category | `'world' \| 'business' \| 'oddities'` |
| enabled | boolean |
| lastPolledAt / lastSuccessAt | Timestamp \| null |
| lastError | string \| null |
| lastItemCount / lastNewCount | number |

**`events/{eventId}`** – ID: `{sourceId}_{first 32 hex chars of sha256(externalId)}` (ADR-013).

| field | type |
|---|---|
| sourceId | SourceId |
| externalId | string (BBC: guid without the `#N` suffix; Reddit: Atom `<id>`, e.g. `t3_…`) |
| category | string |
| title / summary | string (plain text, entities decoded) |
| url | string |
| publishedAt / ingestedAt | Timestamp (`ingestedAt` = server time) |
| attributes | map<string, string> (e.g. `author`) |

**`rules/{ruleId}`** – top-level (admin lists all; matcher queries without collection group). ID: Firestore auto-ID (alphanumeric, keeps the delivery ID unambiguous).

| field | type |
|---|---|
| userId | string |
| name | string |
| sourceIds | SourceId[] (≥1) |
| keywords | string[] (≥1, lower-cased and trimmed on save) |
| channels | ChannelId[] (≥1) |
| active | boolean |
| createdAt / updatedAt | Timestamp |

**`deliveries/{eventId}_{ruleId}_{channel}`** – deterministic ID (A14, ADR-009).

| field | type |
|---|---|
| eventId, ruleId, userId, channel | string |
| status | `'pending' \| 'sending' \| 'sent' \| 'failed'` |
| error | string \| null |
| eventTitle, eventUrl, sourceId, ruleName | string (snapshot for admin table / S2, no joins) |
| createdAt / sentAt | Timestamp / Timestamp \| null |

Recipients (email address, Slack webhook) are **never** stored in deliveries; the channel resolves them at send time.

**Access** (enforced in `firestore.rules`, authored via `firestore-rules-author`)

| collection | user | admin (`admin` claim) | Cloud Functions (Admin SDK) |
|---|---|---|---|
| sources | read (signed-in, for the rule form) | read *(C3: update `enabled`)* | write |
| events | – | read | create |
| rules | CRUD own (`userId == auth.uid`, validated shape) | read all *(C4: update `active`)* | read |
| deliveries | read own | read all *(C2: retry via callable)* | create / update |

**`rules` write constraints:** on create, `createdAt == request.time` and `userId == request.auth.uid`; on update, `createdAt` and `userId` are immutable. Reason: the A5 filter (`rule.createdAt < event.ingestedAt`) depends on `createdAt`, so a client must not be able to backdate a rule.

## 2. Interfaces

```ts
type SourceId = 'bbc-world' | 'bbc-business' | 'reddit-nottheonion';
type ChannelId = 'email' | 'slack';

interface SourceConfig {
  id: SourceId; name: string; category: EventCategory;
  url: string; replayFixture: string;
}

interface NormalizedEvent {
  sourceId: SourceId; externalId: string; category: EventCategory;
  title: string; summary: string; url: string;
  publishedAt: Date; attributes: Record<string, string>;
}

interface SourceAdapter {
  readonly source: SourceConfig;
  fetchEvents(signal: AbortSignal): Promise<NormalizedEvent[]>;
}
// FeedSourceAdapter (HTTP + custom User-Agent) and ReplaySourceAdapter (fixture file)
// differ only in how they obtain the XML; both call parseFeed(xml).

interface NotificationMessage {
  deliveryId: string; userId: string; ruleName: string;
  event: NormalizedEvent;
}

interface NotificationChannel {
  readonly id: ChannelId;
  send(message: NotificationMessage): Promise<void>; // throws on failure; resolves its own recipient
}

const channelRegistry: Record<ChannelId, NotificationChannel>;
```

The channel resolves its own recipient, so the dispatcher never knows about email addresses or webhooks – that is what lets the Slack commit leave dispatcher code untouched (ADR-011).

**Feed parsing:** `parseFeed(xml)` parses once and selects a mapper by root element (`rss.channel.item[]` vs `feed.entry[]`). Reddit summary = text of `<div class="md">` if present, otherwise empty – 24 of 25 live entries have no `<div class="md">` (23 link posts with a `<table>` of "submitted by … [link] [comments]" boilerplate, 1 with only the "submitted by" text).

## 3. Pipeline

```
 onSchedule('every 5 minutes') ─┐
 onCall pollSourcesNow (admin) ─┴─► pollAllSources()          [shared code, ADR-005]
                                      │ Promise.allSettled per source, 10 s timeout
                                      ▼
                         adapter.fetchEvents() → parseFeed → normalize
                                      │ failure → sources.lastError, other sources continue
                                      ▼
                         events.doc(id).create()              ◄─ IDEMPOTENCY 1: ALREADY_EXISTS = duplicate, skip
                                      │
                         onDocumentCreated('events/{eventId}')   matchEvent
                                      │ load active rules (in memory, A17)
                                      │ filter: sourceId ∈ rule.sourceIds
                                      │         AND rule.createdAt < event.ingestedAt  (A5)
                                      │         AND any keyword in title+summary (case-insensitive)
                                      ▼
                         deliveries.doc(`${eventId}_${ruleId}_${ch}`).create({status:'pending'})
                                      │                       ◄─ IDEMPOTENCY 2: trigger re-run creates nothing new
                         onDocumentCreated('deliveries/{id}')    sendDelivery
                                      │ transaction: pending → sending, else exit
                                      │                       ◄─ IDEMPOTENCY 3: duplicate trigger cannot send twice
                                      ▼
                         channelRegistry[channel].send()
                                      ├─ ok    → status 'sent', sentAt
                                      └─ throw → status 'failed', error = message (no retry, A13)
```

| Step | Function / trigger | Errors | Idempotency |
|---|---|---|---|
| poll | `pollSources` (`onSchedule`), `pollSourcesNow` (`onCall`, `request.auth?.token.admin === true`, else `HttpsError('permission-denied')`) | Caught per source → `sources.lastError`; other sources continue | – |
| events create | inside poll | `ALREADY_EXISTS` = duplicate (counted, not an error) | Deterministic event ID + `create()` |
| match | `matchEvent` (`onDocumentCreated`) | Logged; no retry – a missed match is accepted for the MVP | Deterministic delivery ID + `create()` |
| send | `sendDelivery` (`onDocumentCreated`) | Never crashes; becomes `failed` with a readable reason | `pending → sending` transaction; email `Message-ID` derived from delivery ID |

A crash between `send()` and the status write leaves the delivery in `sending` and nothing is resent: delivery is deliberately **at-most-once**.

## 4. Dependencies (to be approved before installing)

**Approved:** `fast-xml-parser` and `vitest` (dev) in `functions/` – installed by me, 2026-10-19 18:14 (prompt #11). The others are still pending.

| Package | Where | Why |
|---|---|---|
| `fast-xml-parser` | functions | Zero-dep parser for RSS 2.0 + Atom incl. CDATA; a hand-written XML parser is not worth the risk |
| `nodemailer`, `@types/nodemailer` (dev) | functions | Standard SMTP client, sends to Mailpit |
| `vitest` (dev) | functions | No test runner in functions yet; same runner as the frontend |
| `@firebase/rules-unit-testing` (dev) | root | Security-rules tests in the emulator (M2 acceptance criteria) |
| `firebase` | frontend | Modular JS SDK, wrapped in `core/services`. No `@angular/fire` – Angular 22 support unknown, the plain SDK is enough |

Not npm: Slack uses Node 24's built-in `fetch`; Mailpit is a binary / Docker image.

## 5. Open points

- **Demo step 6 (`scope.md`)** does not work as written: re-fetching replay data is deduplicated, so nothing new is sent. Needs a second replay fixture or a replay reset. Not solved yet.
- **First poll on a fresh emulator** ingests every item currently in the feeds (~25–45 per feed). Correct under A5 and what the demo relies on, but broad keywords will fire many alerts.
- **To verify with the Firebase skills before coding:** `firebase-functions` v7 import paths (scaffold uses `firebase-functions/https`); that the Functions emulator populates `request.auth` for `onCall` from Auth emulator tokens; the error code of `create()` on an existing doc (expected gRPC 6 `ALREADY_EXISTS`); whether `fast-xml-parser` decodes HTML entities (`&#32;`, `&quot;`) in Reddit's escaped HTML.
- **`#N` suffix on BBC guids:** the fixture only proves it is not unique per story (`c60rl1xvjv89o#0` and `#3` in `functions/fixtures/bbc-business.xml`); its meaning at BBC is unknown.
