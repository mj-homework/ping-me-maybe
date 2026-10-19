# MVP Scope – Ping Me Maybe

> **Phase 2 output.** Turns the open questions of Phase 1 into a commitment: what is built, what is deliberately not built, and how "done" is verified.
> All timestamps: Europe/Budapest, `YYYY-MM-DD HH:mm`.
> **Last updated:** 2026-10-19 15:51 – aligned with `assumptions.md` after AI review (sources, Slack priority, admin actions, Reddit score).
> **Updated:** 2026-10-19 16:59 – feed URLs and Reddit access verified (User-Agent required, Reddit is Atom); fixtures listed; open questions 1–2 closed.

Related decisions: ADR-007 (sources), ADR-008 (definition of "important"), ADR-009 (dedup), ADR-010 (replay adapter), ADR-011 (channel order).

---

## 1. Product statement

A logged-in user defines **alert rules** over news feeds. When a new item from **BBC** or **Reddit r/nottheonion** matches a rule, the user is notified by **email** (and by **Slack**, once email works end-to-end). An **admin view** shows ingested events, deliveries, failures and sources, and can trigger a fetch on demand.

**"Important" (A1, ADR-008):** an item matches a user's rule = selected feed(s) **+** keywords/phrases in title or summary. No ML/LLM scoring.

## 2. Sources (A2, ADR-007)

| Feed | URL | Format | Covers (brief category) | Character |
|---|---|---|---|---|
| **BBC World** | `https://feeds.bbci.co.uk/news/world/rss.xml` | RSS 2.0 | Breaking news; natural disasters via keywords (`earthquake`, `flood`, …) | Serious |
| **BBC Business** | `https://feeds.bbci.co.uk/news/business/rss.xml` | RSS 2.0 | Market movements | Serious |
| **Reddit r/nottheonion** | `https://www.reddit.com/r/nottheonion/.rss` | **Atom** | Real news that sounds made up | Playful |

- All feeds are public, no API keys. **Two formats:** BBC is RSS 2.0, Reddit is Atom (verified 16:59, see `ai-review-log.md`). One feed parser handles both.
- **Every request sends a custom User-Agent** – Reddit returns 403 without one.
- All sources implement one `SourceAdapter` and normalize into the A3 `Event` shape: `{ sourceId, externalId, category, title, summary, url, publishedAt, attributes{} }`. `externalId` = RSS `guid` / Atom `<id>`.
- A `ReplaySourceAdapter` serves saved responses for tests and demo fallback (ADR-010). Fixtures:
  - `fixtures/bbc-world.xml`, `fixtures/bbc-business.xml`, `fixtures/reddit-nottheonion.xml` – live snapshots, the shape reference for parser tests.
  - `fixtures/reddit-nottheonion.demo.xml` – curated, deterministic match / no-match cases for matcher tests and the demo (`florida` rule).

## 3. User stories (MoSCoW)

### Must – in build order

| # | Story | Depends on |
|---|---|---|
| M1 | As a **user**, I can sign up and log in. | – |
| M2 | As a **user**, I can create, edit, pause and delete an alert rule (feeds, keywords, channels). | M1 |
| M3 | As the **system**, I poll the feeds, normalize items to events and store each event once. | – |
| M4 | As a **user**, I receive an **email** when a matching event arrives. | M2, M3 |
| M5 | As an **admin**, I see ingested events, all users' rules and all deliveries with status (`sent` / `failed`) and the failure reason. | M4 |
| M6 | As an **admin**, I can trigger **"Fetch now"** to poll sources on demand. | M3 |

**Admin write actions (A15):** the buttons for *disable rule*, *retry delivery* and *enable/disable source* are present in the admin UI **from the start, but disabled**. Enabling them is tracked as C2–C4 below.

### Should

| # | Story | Depends on |
|---|---|---|
| S1 | As a **user**, I receive a **Slack** message when a matching event arrives (A11 – stretch goal). | **M4 passes its acceptance criteria** (ADR-011) |
| S2 | As a user, I see a history of my triggered alerts in the app. | M4 |
| S3 | As an admin, I see each source and its last successful poll time / last error. | M3 |
| S4 | The same event is never delivered twice for the same rule and channel (idempotency, A14, ADR-009). *Effectively part of M4 – listed separately so it is tested explicitly.* | M4 |

### Could

| # | Story |
|---|---|
| C1 | Third channel (generic webhook or in-app inbox) as a further extensibility demo. |
| C2 | Enable admin action: retry a failed delivery. |
| C3 | Enable admin action: enable/disable a source. |
| C4 | Enable admin action: disable a user's rule. |
| C5 | Reddit minimum score (upvotes) as a rule condition. *Needs the `.json` endpoint instead of RSS plus re-polling of already-seen posts – too much complexity for the MVP.* |
| C6 | Per-user rate limit (max N notifications per hour). |

### Won't (this time)

| Item | Reason |
|---|---|
| ML/LLM importance scoring | Not verifiable within 24h; opaque; high risk of plausible-but-wrong output (ADR-008) |
| USGS / other structured disaster feeds | Dropped in Phase 1 (A2, ADR-007) |
| Paid news/market APIs | Keys, rate limits, cost |
| Digests / batching, quiet hours | Nice UX, not needed to prove the core flow (A9) |
| SMS / mobile push | Channel abstraction allows it later |
| Real deployment, billing | Emulator-only by design (ADR-002, ADR-004) |
| Admin user management beyond the admin claim | Out of brief (A16) |
| i18n | Out of brief (A18) |

## 4. Acceptance criteria (Must)

**M2 – Alert rule CRUD**
- A rule requires at least one feed, at least one keyword, and at least one channel.
- A user can only read and write their own rules (enforced in Firestore security rules, tested with the rules emulator).
- A paused rule never matches.
- **Creating a rule does not trigger alerts for already-ingested events** (A5).

**M3 – Ingestion**
- Polling the same feed twice produces no duplicate `events` documents (dedup key `sourceId + externalId`, A3).
- A source failure (timeout, 4xx/5xx, malformed payload) is recorded and does not stop other sources.

**M4 – Email** *(gate for S1)*
- Given an active rule "BBC World, keyword `earthquake`, channel email"
- When an event whose title contains "Earthquake" is ingested
- Then exactly **one** email arrives in Mailpit with title, source, publish time and link
- And a `deliveries/{eventId}_{ruleId}_email` document exists with status `sent`
- And re-ingesting / re-polling the same event sends **nothing** (S4).
- Keyword matching is case-insensitive.
- If the SMTP server is unreachable, the delivery is `failed` with a readable reason, not a crash (A13).

**M5 – Admin view**
- Only users with the `admin` custom claim can open `/admin` and read all events, rules and deliveries (route guard **and** security rules).
- Failed deliveries show the reason.
- Write-action buttons are visible but disabled (A15).

**M6 – Fetch now**
- The HTTP function rejects non-admin callers.
- Uses the same polling code as the scheduled function.

**S1 – Slack** *(if built)*
- Same criteria as M4 with channel Slack and an incoming webhook.
- **The Slack commit does not modify matcher or dispatcher code** – only a new channel adapter and its registration (A12, ADR-011).
- An invalid webhook URL results in `failed` with a readable reason, not a crash.

## 5. Cut lines

Decided now so they aren't decided at 3 a.m. Cut in this order:

1. Could items (C1–C6)
2. S3 (source health), then S2 (user history)
3. S1 (Slack) – the channel abstraction is then argued in the README instead of proven by a diff
4. Reddit adapter → keep BBC only, r/nottheonion via replay fixtures
5. **Never cut:** idempotency (S4), security rules, `ai-review-log.md`, the README.

## 6. Demo script (≈3 minutes)

1. Start emulators + app (`firebase emulators:start`, `ng serve`).
2. Log in as a **user** → create two rules: *BBC World, keywords `earthquake, flood`, channel email* and *r/nottheonion, keyword `florida`, channel email (+ Slack if built)*.
3. Log in as **admin** → **Fetch now** (replay adapter for a deterministic demo).
4. Show the emails in Mailpit (and the Slack message, if S1 is built).
5. **Fetch now** again → show that nothing is sent twice.
6. Stop Mailpit (or use a broken Slack webhook) → Fetch new replay data → admin deliveries table shows `failed` with its reason.
7. Show the disabled admin write actions and explain the plan for them.
8. If S1 is built: show the Slack commit diff → no pipeline changes (extensibility proof).

## 7. Open questions carried from Phase 1

- [x] Exact feed URLs for BBC World, BBC Business and r/nottheonion. *(16:59 – see section 2.)*
- [x] Reddit: does the public `.rss` endpoint work without auth, and what User-Agent / rate limit applies? *(16:59 – works without auth, but only with a custom User-Agent (403 without); format is Atom. Rate limit not measured; demo polling every few minutes is assumed to be safe.)*
- [ ] Polling interval for the scheduled function – proposal: 5 min.
