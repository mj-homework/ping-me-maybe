# MVP Scope – Ping Me Maybe

> **Phase 2 output.** Turns the open questions of Phase 1 into a commitment: what is built, what is deliberately not built, and how "done" is verified.
> All timestamps: Europe/Budapest, `YYYY-MM-DD HH:mm`.
> **Last updated:** 2026-10-19 15:31

Related decisions: ADR-007 (sources), ADR-008 (definition of "important"), ADR-009 (dedup), ADR-010 (replay adapter), ADR-011 (channel order).

---

## 1. Product statement

A logged-in user defines **alert rules** over news feeds. When a new item from **BBC** or **Reddit** matches a rule, the user is notified by **email** and/or **Slack**. An **admin view** shows deliveries, failures and source health, and can trigger a fetch on demand.

**"Important" (ADR-008):** an item matches a user's rule = selected feeds/subreddits **+** keywords/phrases in title or summary **+** optional Reddit minimum score (upvotes). No ML/LLM scoring.

## 2. Sources

| Brief category | BBC (RSS) | Reddit |
|---|---|---|
| Breaking news | World / Top stories | r/worldnews, r/news |
| Market movements | Business | r/stocks |
| Natural disasters | keyword match on World feed | keyword match on r/worldnews |

- All sources implement one `SourceAdapter` and normalize into one `Event` shape: `{ id, source, feed, title, summary, url, publishedAt, score? }`.
- A `ReplaySourceAdapter` serves saved real responses for tests and demo fallback (ADR-010).
- ⚠️ Reddit access rules must be verified before building the Reddit adapter (see `ai-review-log.md`, OPEN item).

## 3. User stories (MoSCoW)

### Must – in build order

| # | Story | Depends on |
|---|---|---|
| M1 | As a **user**, I can sign up and log in. | – |
| M2 | As a **user**, I can create, edit, pause and delete an alert rule (feeds/subreddits, keywords, optional min. Reddit score, channels). | M1 |
| M3 | As the **system**, I poll BBC and Reddit, normalize items to events and store each event once. | – |
| M4 | As a **user**, I receive an **email** when a matching event arrives. | M2, M3 |
| M5 | As a **user**, I receive a **Slack** message when a matching event arrives. | **M4 passes its acceptance criteria** (ADR-011) |
| M6 | As an **admin**, I see all deliveries with status (`sent` / `failed`) and the failure reason. | M4 |
| M7 | As an **admin**, I can trigger **"Fetch now"** to poll sources on demand. | M3 |

### Should

| # | Story |
|---|---|
| S1 | As a user, I see a history of my triggered alerts in the app. |
| S2 | As an admin, I see each source and its last successful poll time / last error. |
| S3 | The same event is never delivered twice for the same rule and channel (idempotency, ADR-009). *Effectively part of M4 – listed separately so it is tested explicitly.* |

### Could

| # | Story |
|---|---|
| C1 | Third channel (generic webhook or in-app inbox) as a further extensibility demo. |
| C2 | Admin can retry a failed delivery. |
| C3 | Admin can enable/disable a source. |
| C4 | Per-user rate limit (max N notifications per hour). |

### Won't (this time)

| Item | Reason |
|---|---|
| ML/LLM importance scoring | Not verifiable within 24h; opaque; high risk of plausible-but-wrong output (ADR-008) |
| USGS / other structured disaster feeds | Dropped in Phase 1 (ADR-007) |
| Paid news/market APIs | Keys, rate limits, cost |
| Digests / batching, quiet hours | Nice UX, not needed to prove the core flow |
| SMS / mobile push | Channel abstraction allows it later |
| Real deployment, billing | Emulator-only by design (ADR-002, ADR-004) |
| Admin user management beyond the admin claim | Out of brief |
| i18n | Out of brief |

## 4. Acceptance criteria (Must)

**M2 – Alert rule CRUD**
- A rule requires at least one feed/subreddit, at least one keyword **or** a min. score, and at least one channel.
- A user can only read and write their own rules (enforced in Firestore security rules, tested with the rules emulator).
- A paused rule never matches.

**M3 – Ingestion**
- Polling the same feed twice produces no duplicate `events` documents (`eventId = {source}_{nativeId}`).
- A source failure (timeout, 4xx/5xx, malformed payload) is recorded and does not stop other sources.

**M4 – Email** *(gate for M5)*
- Given an active rule "BBC World, keyword `earthquake`, channel email"
- When an event whose title contains "Earthquake" is ingested
- Then exactly **one** email arrives in Mailpit with title, source, publish time and link
- And a `deliveries/{eventId}_{ruleId}_email` document exists with status `sent`
- And re-ingesting / re-polling the same event sends **nothing**.
- Keyword matching is case-insensitive.

**M5 – Slack**
- Same criteria as M4 with channel Slack and an incoming webhook.
- **The Slack commit does not modify matcher or dispatcher code** – only a new channel adapter and its registration.
- An invalid webhook URL results in `failed` with a readable reason, not a crash.

**M6 – Admin deliveries**
- Only users with the `admin` custom claim can open `/admin` and read all deliveries (route guard **and** security rules).
- Failed deliveries show the reason.

**M7 – Fetch now**
- The HTTP function rejects non-admin callers.
- Uses the same polling code as the scheduled function.

**Reddit score threshold (ADR-009)**
- A post first seen below the threshold and later above it triggers **once**, on the first poll where the threshold is met.

## 5. Cut lines

Decided now so they aren't decided at 3 a.m. Cut in this order:

1. Could items (C1–C4)
2. S2 (source health), then S1 (user history)
3. Reddit adapter → keep BBC only, Reddit via replay fixtures
4. **Never cut:** idempotency (S3), security rules, `ai-review-log.md`, the README.

## 6. Demo script (≈3 minutes)

1. Start emulators + app (`firebase emulators:start`, `ng serve`).
2. Log in as a **user** → create a rule: *BBC World + r/worldnews, keywords `earthquake, flood`, channels email + Slack*.
3. Log in as **admin** → **Fetch now** (replay adapter for a deterministic demo).
4. Show the email in Mailpit and the message in Slack.
5. **Fetch now** again → show that nothing is sent twice.
6. Admin deliveries table → a rule with a deliberately broken webhook shows `failed` with its reason.
7. Show the Slack commit diff → no pipeline changes (extensibility proof).

## 7. Open questions carried from Phase 1

- [ ] Reddit: do public `.json` / `.rss` endpoints work without auth? (blocks the Reddit adapter, not M4)
- [ ] Reddit re-check window X hours – proposal: 6h
- [ ] Polling interval for the scheduled function – proposal: 5 min
