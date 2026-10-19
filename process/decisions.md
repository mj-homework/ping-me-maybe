# Architecture Decision Records

ADR-style log of significant technical decisions, the alternatives considered and their consequences.

> All timestamps are in Europe/Budapest time (format: `YYYY-MM-DD HH:mm`).

## Template

```markdown
## ADR-NNN: Title

- **Status:** proposed | accepted | superseded by ADR-XXX
- **Date:** YYYY-MM-DD HH:mm

### Context

### Decision

### Alternatives rejected

### Consequences
```

---

## ADR-001: Single Angular app with a lazy-loaded admin route

- **Status:** accepted
- **Date:** 2026-10-19 13:27

### Context

The brief asks for an "admin view", not a separate admin application. Users and admins share the same auth, data model and UI building blocks.

### Decision

One Angular application. The admin area is a lazy-loaded route (`/admin`), later protected by a role guard based on an admin custom claim.

### Alternatives rejected

- **Nx monorepo** – tooling and configuration overhead that is not justified for a single app plus functions.
- **Angular multi-project workspace** (separate admin app) – duplicated bootstrapping, auth and shared code for no user-facing benefit.

### Consequences

- Admin code is only downloaded by users who navigate to it.
- Client-side route guarding is UX only; real authorization must be enforced in Firestore security rules and Cloud Functions.

## ADR-002: Firebase (Auth, Firestore, Functions), emulator-first

- **Status:** accepted
- **Date:** 2026-10-19 13:30

### Context

The app needs authentication, a persistent store for users/alerts/events, scheduled polling of external sources and outbound notifications (email, Slack). It has to be easy for reviewers to run locally.

### Decision

Use Firebase Auth, Cloud Firestore and Cloud Functions (TypeScript), developed and demoed entirely against the Firebase Emulator Suite.

### Alternatives rejected

- **NestJS / Express + PostgreSQL** – full control and portable, but auth, scheduling, migrations and hosting would all have to be built and wired by hand; too much boilerplate for a 24h timebox.
- **Supabase** – comparable speed, but weaker native Angular integration than AngularFire and a less mature local emulator story for scheduled/background jobs.
- **Serverless without a BaaS (e.g. plain cloud functions + separate DB)** – more moving parts and credentials for reviewers.

### Consequences

- **Vendor lock-in** to Firebase/Google Cloud APIs.
- **Limited querying** in Firestore: matching events against alert rules is done in-function rather than with database queries.
- **At-least-once triggers**: Functions may fire more than once for the same event, so notification delivery needs idempotent delivery IDs to avoid duplicate messages.

## ADR-003: Angular stays at the repository root

- **Status:** superseded by ADR-015
- **Date:** 2026-10-19 13:39

### Context

The Angular CLI generated the app at the repo root, and `firebase init` added `functions/` next to it.

### Decision

Keep the Angular app at the root, with Cloud Functions in `/functions`.

### Alternatives rejected

- Moving the frontend into a subfolder (e.g. `/web`) – unnecessary churn in config files.

### Consequences

- Matches the standard Firebase project layout, so tooling and docs apply without adjustment.

## ADR-004: Project ID `demo-ping-me-maybe` (emulator-only)

- **Status:** accepted
- **Date:** 2026-10-19 13:41

### Context

Reviewers must be able to run the project without a Google Cloud account, billing or credentials.

### Decision

Use the project ID `demo-ping-me-maybe`. The `demo-` prefix makes the Firebase CLI treat it as an emulator-only project.

### Alternatives rejected

- A real Firebase project – requires credentials/billing from reviewers and risks touching real cloud resources.

### Consequences

- Reviewers need no billing or credentials, and the code cannot accidentally touch real cloud resources.
- A real project can be attached later via `firebase use --add`.

## ADR-005: Manual `pollSourcesNow` HTTP function alongside the scheduled poller

- **Status:** accepted
- **Date:** 2026-10-19 13:57

### Context

External sources are polled on a schedule. The Functions emulator does not run scheduled functions automatically.

### Decision

Besides the scheduled poller, add an HTTP function `pollSourcesNow`, triggered by an admin "Fetch now" button. Both share the same polling logic.

### Alternatives rejected

- **Triggering the scheduled function manually via the Functions shell / Pub/Sub emulator** – works for developers, but not for a reviewer clicking through the UI.
- **Polling from the Angular client** – exposes source access to the browser, bypasses the server-side pipeline and cannot run without a user online.

### Consequences

- The polling pipeline can be exercised in the emulator.
- Demos are reproducible: the reviewer decides when a fetch happens.
- The HTTP endpoint must be restricted to admins.

## ADR-006: Official Firebase agent skills for Claude Code

- **Status:** accepted
- **Date:** 2026-10-19 14:02

### Context

AI assistants frequently produce outdated or hallucinated Firebase APIs (e.g. v1 vs v2 Functions, namespaced vs modular SDK).

### Decision

Install the official Firebase agent skills for Claude Code so generated code follows current Firebase APIs.

### Alternatives rejected

- **No skills, rely on the model's training data** – known risk of outdated APIs (v1 Functions, namespaced SDK).
- **Pasting Firebase docs into prompts manually** – slower and easy to forget; skills apply consistently.

Note: the skills were not installed during `firebase init` (a typo answered "no" to the prompt) and were installed afterwards via `claude plugin install firebase@firebase`.

### Consequences

- Fewer outdated/hallucinated Firebase API usages.
- Generated code is still reviewed by me, especially security rules and trigger idempotency (see `ai-review-log.md`).

## ADR-007: Drop USGS earthquake feed; use BBC RSS + Reddit as real sources

- **Status:** accepted – partially superseded by ADR-012 (Reddit feed choice and Reddit JSON format)
- **Date:** 2026-10-19 15:06 (at the latest – assumptions.md A2 already rejects USGS in commit 0c4cba2)

### Context

The pre-roadmap proposed the USGS earthquake GeoJSON feed as the one real source (free, no key, has a numeric severity). In Phase 1 I dropped it.

**Reason for dropping USGS:** Unlikely to produce a relevant event during a demo.

### Decision

Real sources are BBC (RSS feeds: World/Top stories, Business) and Reddit (e.g. r/worldnews, r/news, r/stocks). The brief's categories map to feeds:

- breaking news → BBC World / r/worldnews
- market movements → BBC Business / r/stocks
- natural disasters → keyword matching on news feeds

### Alternatives rejected

- **USGS earthquakes** – see reason above.
- **Paid news/market APIs** – keys, rate limits, cost.

### Consequences

- No numeric severity for disasters – detection is keyword-based.
- Two formats (RSS XML, Reddit JSON) → need a normalizing `SourceAdapter`.
- Reddit API access rules must be verified manually (rate limits, User-Agent, possible OAuth) before building on it.
- BBC RSS used for non-commercial demo purposes only (note in README).

## ADR-008: Definition of "important" = user rules + optional source signal

- **Status:** accepted – partially superseded by ADR-012 (Reddit minimum score moved to Could)
- **Date:** 2026-10-19 15:17

### Context

The brief does not define "something important". This is the core ambiguity of the task.

### Decision

An event is important for a user if it matches one of their alert rules: chosen feeds/subreddits + keywords/phrases in title or summary + optional Reddit minimum score (upvotes) as a crowd-sourced severity signal. BBC rules match on feed + keywords only (no score available).

### Alternatives rejected

- **ML/LLM importance scoring** – not verifiable within 24h, opaque to users, high risk of plausible-but-wrong results.
- **A fixed curated "importance" list defined by us** – not flexible per user.

### Consequences

- Transparent, explainable and testable matching.
- Keyword matching can produce false positives/negatives – accepted for MVP and documented.

## ADR-009: Event identity, deduplication and Reddit score threshold crossing

- **Status:** accepted – partially superseded by ADR-012 (score threshold crossing not in MVP; event and delivery IDs still apply)
- **Date:** 2026-10-19 15:17

### Context

Feeds are polled repeatedly, so the same item appears many times. Reddit scores change over time (a post may cross a threshold hours after it was first seen).

### Decision

- Event ID = `{source}_{nativeId}` (RSS guid / Reddit post id), written with create-if-absent so re-polling never creates duplicates.
- Reddit posts from the last X hours are re-checked on each poll; a rule fires once, at the first poll where the score threshold is met.
- Delivery ID = `{eventId}_{ruleId}_{channel}` guarantees at-most-once notification per rule and channel.

### Alternatives rejected

- **Evaluating Reddit posts only when first seen** – would miss posts that become important later.
- **Time-based dedup windows** – fragile.

### Consequences

- Slightly more Firestore reads per poll (re-checking recent Reddit posts), bounded by the X-hour window.

## ADR-010: Fixture/replay source adapter for tests and demos

- **Status:** accepted
- **Date:** 2026-10-19 15:17

### Context

Live BBC/Reddit content changes by the minute; tests and demos built on them are not reproducible, and the Reddit API may rate-limit or block.

### Decision

Add a `ReplaySourceAdapter` implementing the same `SourceAdapter` interface. It serves saved real BBC and Reddit responses from fixture files. Used in all automated tests and as a demo fallback; switchable per source by config.

### Alternatives rejected

- **Testing against live feeds** – flaky.
- **Hand-written fake data only** – would not reflect real feed shapes.

### Consequences

- Deterministic tests and demos.
- Fixtures must be captured once from the real feeds and committed (check they contain nothing sensitive).

## ADR-011: Channel build order – email first, Slack second

- **Status:** accepted – amended by ADR-012 (Slack moved from Must to Should)
- **Date:** 2026-10-19 15:21

### Context

The brief requires both email and Slack, and asks for the design to be "flexible enough that we can add more channels later". Building both channels in parallel would make it hard to tell whether the pipeline or a channel is at fault when something breaks, and would not prove the extensibility claim.

### Decision

- Email is built first and must pass its acceptance criteria end-to-end (rule match → exactly one email in Mailpit → `deliveries` doc with status `sent` → no duplicate on re-poll).
- Slack is started only after that, and is added as a pure `NotificationChannel` adapter plus registration.
- **Success criterion:** the Slack commit changes no matcher or dispatcher code. The diff of that commit is the evidence for the "add more channels later" requirement.
- The third channel (generic webhook / in-app inbox) is moved from Should to Could.

### Alternatives rejected

- **Build email and Slack in parallel** – no clean proof of the channel abstraction; harder debugging.
- **Slack first** – needs a real Slack workspace/webhook earlier; email via a local SMTP catcher is faster to validate.
- **Third channel as a Must to prove extensibility** – Slack already serves as that proof when added as an isolated adapter.

### Consequences

- The pipeline is validated with one channel before the abstraction is tested.
- If the Slack commit has to touch the pipeline, that is logged as a design flaw in `ai-review-log.md` and fixed before continuing.
- Frees roughly 1–2 hours by downgrading the third channel.

## ADR-012: Narrowed MVP – r/nottheonion via RSS, no Reddit score, Slack as stretch goal

- **Status:** accepted
- **Date:** 2026-10-19 15:51
- **Supersedes:** parts of ADR-007, ADR-008, ADR-009; amends ADR-011

### Context

After the AI review of `scope.md` against `assumptions.md` (A1, A2, A3, A11, A15), the MVP was narrowed. ADR-007…009 and ADR-011 were written before that review and no longer match `scope.md`:

- ADR-007 names r/worldnews, r/news, r/stocks and assumes Reddit JSON (two input formats).
- ADR-008 includes an optional Reddit minimum score in the definition of "important".
- ADR-009 describes re-checking Reddit posts until they cross a score threshold.
- ADR-011 treats Slack as a Must.

### Decision

1. **Sources:** BBC World (RSS), BBC Business (RSS) and **Reddit r/nottheonion via its RSS feed**. All sources are plain RSS – one input format, no API keys.
2. **"Important"** = selected feed(s) + keywords/phrases in title or summary. The Reddit minimum score is **not** part of the MVP (moved to Could, C5).
3. **No score threshold crossing:** an event is evaluated once, when it is first ingested. Still valid from ADR-009: event ID `{sourceId}_{externalId}` (create-if-absent) and delivery ID `{eventId}_{ruleId}_{channel}`.
4. **Slack** moves from Must to **Should** (S1, stretch goal). The ADR-011 build order and its success criterion (the Slack commit touches no matcher/dispatcher code) still apply if Slack is built.

### Alternatives rejected

- **Keep the Reddit score in the MVP** – requires the Reddit `.json` endpoint (a second input format) plus re-polling of already-seen posts; too much complexity for the timebox.
- **Silently edit ADR-007…009 and ADR-011** – would hide how the design evolved; the decision log is meant to show course-corrections.
- **Drop Reddit entirely** – r/nottheonion adds a playful, recognisable demo feed at almost no cost, since it is RSS like BBC.

### Consequences

- One `SourceAdapter` implementation (RSS) covers all real sources; the normalizer is simpler.
- r/nottheonion is a playful feed and does not map to "market movements"; that brief category is covered by BBC Business only.
- The ADR-009 consequence "more Firestore reads per poll for re-checking recent Reddit posts" no longer applies.
- If Slack is not built, the channel abstraction is argued in the README instead of proven by a commit diff (scope cut line 3).
- Reddit RSS access rules (User-Agent, rate limits) still have to be verified (see `ai-review-log.md`, OPEN item).

## ADR-013: Design refinements – event ID hashing, BBC guid normalization, onCall, source config in code

- **Status:** accepted
- **Date:** 2026-10-19 17:26
- **Amends:** ADR-005, ADR-009, ADR-012 (point 3); assumptions A3, A12

### Context

Writing `design.md` (prompt #7) required concrete choices that earlier documents left open or stated differently:

- ADR-009/012 define the event ID as `{sourceId}_{externalId}`, but `externalId` can be a URL (BBC guid), and Firestore document IDs cannot contain `/`.
- `fixtures/bbc-business.xml` contains the same article twice with different guids: `…/articles/c60rl1xvjv89o#0` and `…#3` (same title, same `pubDate`). Using the raw guid (A3) would create two events and send two notifications.
- ADR-005 and M6 say "HTTP function" without specifying how the admin claim is checked.
- A12 names the channel interface `ChannelAdapter`, ADR-011 names it `NotificationChannel`.

### Decision

1. **Event ID** = `{sourceId}_{first 32 hex chars of sha256(externalId)}`. The raw `externalId` is stored as a field.
2. **BBC `externalId`** = guid with the trailing `#N` suffix stripped. Reddit uses the Atom `<id>` (`t3_…`) unchanged.
3. **`pollSourcesNow` is an `onCall` function** checking `request.auth?.token.admin === true`; still an HTTPS function in the sense of ADR-005.
4. **Channel interface name: `NotificationChannel`** (ADR-011 wins over A12).
5. **Source definitions live in code**, runtime state (`enabled`, last poll, last error) in the `sources` collection. Replay mode is a Functions param `SOURCE_MODE=live|replay`.

### Alternatives rejected

- **Raw `externalId` as ID with `/` replaced** – escaping rules are easy to get wrong and IDs can approach the 1500-byte limit; hashing is uniform for URLs and `t3_…` values.
- **Raw BBC guid as `externalId`** – proven non-unique per story by the fixture (duplicate notification, breaks S4).
- **`onRequest` with manual `verifyIdToken`** – needs Authorization header handling and CORS that `onCall` provides.
- **Source list in Firestore** – URLs and adapter wiring need a code change anyway; a seed step adds setup for reviewers.

### Consequences

- Event IDs are not human-readable beyond the source prefix; `externalId` is kept as a field for debugging.
- The meaning of BBC's `#N` suffix is unknown. If it marks a substantial story update, those updates are now deliberately not re-notified.
- A12 wording ("ChannelAdapter") is outdated; `NotificationChannel` is the name used in code.

## ADR-014: Rule keywords are OR-ed

- **Status:** accepted
- **Date:** 2026-10-19 17:53
- **Amends:** ADR-008; assumption A7 ("AND logic only")

### Context

A7 stated "AND logic only", and `design.md` (prompt #7) implemented it as "every keyword in title+summary". The demo rule in `scope.md` ("BBC World, keywords `earthquake, flood`") would then only fire for an item mentioning both – almost never. The M4 acceptance test uses a single keyword, so it would not have caught this.

### Decision

A rule matches if the event's source is in `rule.sourceIds` **and any** of `rule.keywords` appears in title + summary (case-insensitive). Conditions across fields (source AND keywords) stay AND-ed; keywords within a rule are OR-ed.

### Alternatives rejected

- **AND over keywords** – makes the multi-keyword demo rule practically never fire; users expect a keyword list to mean "any of these".
- **Per-rule AND/OR toggle** – more UI and test surface than the MVP needs; a user who needs AND can approximate it with a phrase.

### Consequences

- New M4 acceptance criterion: a rule with several keywords matches when any one of them appears.
- Broader matching → more false positives (already accepted in ADR-008) and more alerts per poll (A9 noise risk).
- This is a separate ADR rather than an amendment to ADR-013: it changes what "important" means (product, ADR-008/A7), not a technical design detail, and ADR-013 was already accepted.

## ADR-015: Angular app moves to app/, next to functions/

- **Status:** accepted
- **Date:** 2026-10-19 20:53
- **Supersedes:** ADR-003

### Context

ADR-003 kept Angular at the root citing "the standard Firebase layout". The Firebase docs only fix `firebase.json` at the root and a `functions/` source folder; they say nothing about where the frontend lives.

### Decision

`app/` (Angular) and `functions/` (Cloud Functions) side by side. Firebase config (`firebase.json`, `.firebaserc`, `firestore.*`), `process/`, `CLAUDE.md` and `README.md` stay at the root.

### Alternatives rejected

- **Keep Angular at the root** – mixes the frontend's config and `node_modules` with the Firebase project config.

### Consequences

- Angular commands (`ng build`, `ng test`, `npm install`) run in `app/`.
- Paths updated in `.gitignore`, `.vscode/tasks.json`, `README.md` and the `CLAUDE.md` Stack line and folder tree; historical process entries keep the old paths.

## ADR-016: One code style across the repo: functions/ follows the root Prettier config

- **Status:** accepted
- **Date:** 2026-10-19 21:43

### Context

`functions/` used the Google ESLint style (double quotes, no spaces in braces, max 80). The root `.prettierrc` and `.editorconfig` use single quotes and width 100, so formatting a functions file in the IDE broke lint (53 errors).

### Decision

`functions/` ESLint adjusted to the Prettier style (`quotes` single, `object-curly-spacing` always, `max-len` 100, `quote-props` as-needed); `functions/.prettierrc` removed.

### Alternatives rejected

- **A separate `functions/.prettierrc` matching the Google style** – two styles in one repo. It was briefly in place in 635475b.

### Consequences

- One formatter for the whole repo.
- The style-only diff touches every functions file.
