# Prompt Log

Chronological log of every AI prompt used on this project, with its outcome and whether the result was accepted, changed or rejected.

## Template

```markdown
### #N

- **Timestamp:** YYYY-MM-DD HH:mm
- **Tool:**
- **Prompt:**

  > ...

- **Outcome:**
- **Verdict:** accepted | changed | rejected
```

---

### #1

- **Timestamp:** 2026-10-19 14:05 (+0200)
- **Tool:** Claude Code (WebStorm)
- **Prompt:**

````text
Context: This is "Ping Me Maybe", a homework project for a job interview. The brief: users set up alerts to get notified about important world events (breaking news, market movements, natural disasters) via email and Slack, extensible to more channels later, plus an admin view. The evaluators grade the PROCESS (planning, decisions, how I review AI output), not just the code.

Stack (already decided and initialized):
- Angular app at the repo root
- Firebase: Auth, Firestore, Cloud Functions (TypeScript, in /functions), Emulator Suite (Auth, Functions, Firestore + Emulator UI)
- Project ID: demo-ping-me-maybe (emulator-only, no real Firebase project, no billing)
- Firebase agent skills are installed for you – use them for Firebase APIs.

Task: create ONLY scaffolding and documentation. No business logic, no new npm dependencies, no changes to angular.json, package.json, firebase.json or anything inside /functions/src.

1. Verify (read only, report back): .firebaserc default project is "demo-ping-me-maybe"; firebase.json contains auth, firestore and functions emulators; /functions is TypeScript. If anything differs, tell me – do not fix it.

2. Create `process/` with these markdown files, each with a title, one-line purpose and an empty template:
   - `prompts.md` – chronological log of every AI prompt (template: #, timestamp, tool, prompt, outcome, accepted/changed/rejected). Add THIS prompt as entry #1, verbatim, with tool "Claude Code (WebStorm)".
   - `decisions.md` – ADR-style log (Context / Decision / Alternatives rejected / Consequences). Pre-fill:
     - ADR-001: Single Angular app with lazy-loaded admin route. Brief says "admin view", not "admin app". Rejected: Nx monorepo, Angular multi-project workspace.
     - ADR-002: Firebase (Auth, Firestore, Functions), emulator-first. Trade-offs: vendor lock-in, limited querying (rule matching done in-function), at-least-once triggers (need idempotent delivery IDs).
     - ADR-003: Angular stays at repo root (standard Firebase layout, avoids churn).
     - ADR-004: Project ID "demo-ping-me-maybe" – emulator-only, reviewers need no billing/credentials, cannot touch real cloud resources; a real project can be attached later via `firebase use --add`.
     - ADR-005: Besides a scheduled poller, add an HTTP function `pollSourcesNow` triggered by an admin "Fetch now" button, because the Functions emulator does not run schedules automatically, and it makes demos reproducible.
     - ADR-006: Installed official Firebase agent skills for Claude Code to reduce outdated/hallucinated Firebase API usage. Generated code is still reviewed (esp. security rules and trigger idempotency).
   - `assumptions.md` – table: Question | Assumption | Why | Status. Leave rows empty.
   - `ai-review-log.md` – template: what the AI produced, what I checked, what I changed/rejected, why.
   - `plan.md` – empty headings: Goal, Scope (in/out), Phases, Deliverables, Risks.

3. In `src/app/` create minimal standalone placeholder components (heading only, no logic):
   - `core/guards/`, `core/services/`, `core/models/` (each with `.gitkeep`)
   - `shared/` (`.gitkeep`)
   - `features/alerts/` – `AlertsPageComponent`
   - `features/admin/` – `AdminPageComponent`
   - Update `app.routes.ts`: `/alerts` and `/admin` lazy-loaded via `loadComponent`, default redirect to `/alerts`. No guard yet; add `// TODO: roleGuard (admin custom claim)`.

4. Create root `CLAUDE.md`: project purpose, stack, folder structure, conventions (standalone components, signals, strict TypeScript, no new deps without asking, emulator-only, never hardcode secrets/webhook URLs), and the rule "log every prompt in process/prompts.md".

5. Check `.gitignore` covers: node_modules, functions/lib, functions/node_modules, .env*, *-debug.log, emulator export data. Add only missing entries.

Use the Angular version and conventions already in this repo (check package.json; do not assume a version).
When done: list every file created or modified, report the result of step 1, and run `ng build` to confirm it compiles. Do not commit.
````

- **Outcome:** _(to be filled after review)_
- **Verdict:** _(accepted | changed | rejected)_

### #2

- **Timestamp:** 2026-10-19 14:31
- **Tool:** Claude Code (WebStorm)
- **Prompt:**

````text
Update process/decisions.md:

1. Add a "Date:" line to every ADR in the format YYYY-MM-DD HH:mm (Europe/Budapest time, add a note at the top of the file stating the timezone). Use exactly these values – do not invent or adjust them:
   - ADR-001: 2026-10-19 13:27
   - ADR-002: 2026-10-19 13:30
   - ADR-003: 2026-10-19 13:39
   - ADR-004: 2026-10-19 13:41
   - ADR-005: 2026-10-19 13:57
   - ADR-006: 2026-10-19 14:02
2. Update the ADR template at the top so future entries include the "Date: YYYY-MM-DD HH:mm" line.
3. Apply the same timestamp format (YYYY-MM-DD HH:mm) to the templates in process/prompts.md and process/ai-review-log.md.
4. Add to CLAUDE.md conventions: "All process log entries use timestamps in YYYY-MM-DD HH:mm, Europe/Budapest time. Never guess a timestamp – ask me if you don't know it."
5. Log this prompt in process/prompts.md as the next entry.

Change nothing else. Show me the diff when done.
````

- **Outcome:** _(to be filled after review)_
- **Verdict:** _(accepted | changed | rejected)_

### #3

- **Timestamp:** 2026-10-19 15:18
- **Tool:** Claude Code (WebStorm)
- **Prompt:**

````text
Append the following ADRs to process/decisions.md.
Use the next free ADR numbers (check the file first – do not renumber existing ADRs).
Follow the existing ADR template (Date / Context / Decision / Alternatives rejected / Consequences).
Use the timestamps exactly as given. Where it says [FILL IN], leave the placeholder literally – do NOT guess or fill it.

---

ADR: Drop USGS earthquake feed; use BBC RSS + Reddit as real sources
Date: [FILL IN: YYYY-MM-DD HH:mm when I dropped earthquakes in Phase 1]
Context: The pre-roadmap proposed the USGS earthquake GeoJSON feed as the one real source (free, no key, has a numeric severity). In Phase 1 I dropped it.
Decision: Real sources are BBC (RSS feeds: World/Top stories, Business) and Reddit (e.g. r/worldnews, r/news, r/stocks). The brief's categories map to feeds: breaking news → BBC World / r/worldnews; market movements → BBC Business / r/stocks; natural disasters → keyword matching on news feeds.
Reason for dropping USGS: [FILL IN: my reason]
Alternatives rejected: USGS earthquakes (see reason), paid news/market APIs (keys, rate limits, cost).
Consequences: No numeric severity for disasters – detection is keyword-based. Two formats (RSS XML, Reddit JSON) → need a normalizing SourceAdapter. Reddit API access rules must be verified manually (rate limits, User-Agent, possible OAuth) before building on it. BBC RSS used for non-commercial demo purposes only (note in README).

---

ADR: Definition of "important" = user rules + optional source signal
Date: 2026-10-19 15:17
Context: The brief does not define "something important". This is the core ambiguity of the task.
Decision: An event is important for a user if it matches one of their alert rules: chosen feeds/subreddits + keywords/phrases in title or summary + optional Reddit minimum score (upvotes) as a crowd-sourced severity signal. BBC rules match on feed + keywords only (no score available).
Alternatives rejected: ML/LLM importance scoring (not verifiable within 24h, opaque to users, high risk of plausible-but-wrong results); a fixed curated "importance" list defined by us (not flexible per user).
Consequences: Transparent, explainable and testable matching. Keyword matching can produce false positives/negatives – accepted for MVP and documented.

---

ADR: Event identity, deduplication and Reddit score threshold crossing
Date: 2026-10-19 15:17
Context: Feeds are polled repeatedly, so the same item appears many times. Reddit scores change over time (a post may cross a threshold hours after it was first seen).
Decision: Event ID = `{source}_{nativeId}` (RSS guid / Reddit post id), written with create-if-absent so re-polling never creates duplicates. Reddit posts from the last X hours are re-checked on each poll; a rule fires once, at the first poll where the score threshold is met. Delivery ID = `{eventId}_{ruleId}_{channel}` guarantees at-most-once notification per rule and channel.
Alternatives rejected: evaluating Reddit posts only when first seen (would miss posts that become important later); time-based dedup windows (fragile).
Consequences: Slightly more Firestore reads per poll (re-checking recent Reddit posts), bounded by the X-hour window.

---

ADR: Fixture/replay source adapter for tests and demos
Date: 2026-10-19 15:17
Context: Live BBC/Reddit content changes by the minute; tests and demos built on them are not reproducible, and the Reddit API may rate-limit or block.
Decision: Add a ReplaySourceAdapter implementing the same SourceAdapter interface. It serves saved real BBC and Reddit responses from fixture files. Used in all automated tests and as a demo fallback; switchable per source by config.
Alternatives rejected: testing against live feeds (flaky); hand-written fake data only (would not reflect real feed shapes).
Consequences: Deterministic tests and demos; fixtures must be captured once from the real feeds and committed (check they contain nothing sensitive).

---

After appending: show me the diff, list the [FILL IN] placeholders that remain, and log this prompt as the next entry in process/prompts.md. Change nothing else.
````

- **Outcome:** _(to be filled after review)_
- **Verdict:** _(accepted | changed | rejected)_

### #4

- **Timestamp:** 2026-10-19 15:38
- **Tool:** Claude Code (WebStorm)
- **Prompt:**

  > //add a title signal

- **Outcome:** Added a `title` signal to `AdminPageComponent` and bound the heading to its value.
- **Verdict:** accepted

### #5

- **Timestamp:** 2026-10-19 15:39
- **Tool:** Claude Code (WebStorm)
- **Prompt:**

  > add a button
  >
  > in the click event change the title to something

- **Outcome:** Workflow test of Claude Code in WebStorm (title signal + button on the admin page). Not part of the product; code reverted in commit [hash].
- **Verdict:** rejected (experiment)

### #6

- **Timestamp:** 2026-10-19 16:30
- **Tool:** Claude Code (WebStorm)
- **Prompt:**

````text
Fix two config issues found in a repo review, and document the review. Change nothing else.

### Part A – Config fixes

1. `.firebaserc` is currently `{}`. Set it to:
   { "projects": { "default": "demo-ping-me-maybe" } }

2. `firestore.rules` is the default open rule from `firebase init` (allow read, write until 2026-11-18). Replace it with a deny-all rule for all documents:
   `allow read, write: if false;`
   Add a comment: "Deny-all until real rules are written together with the data model. Client access is opened per collection later (see CLAUDE.md, ADR-001)."

3. Do NOT touch `src/app/features/admin/admin-page.ts` – I will decide about it myself.

### Part B – decisions.md

4. In ADR-007, replace the reason placeholder `[FILL IN: my reason]` with the reason already stated in process/assumptions.md A2: "Unlikely to produce a relevant event during a demo." Copy it, do not rephrase or extend it.
   Leave the Date placeholder `[FILL IN: ...]` as it is – do not guess a time.

### Part C – ai-review-log.md

5. Append these entries to process/ai-review-log.md, using the existing template. Use the timestamps exactly as given. Do not add findings of your own.

### 2026-10-19 16:16 – `.firebaserc` without the demo project ID (repo review)
- What the AI produced: `firebase init` output plus the scaffolding prompt (#1), whose step 1 was to verify that `.firebaserc` contains `demo-ping-me-maybe` and report any difference.
- What I checked: A repo review in the planning chat flagged `.firebaserc` as `{}`; I confirmed it in the file.
- What I changed / rejected: Set the default project to `demo-ping-me-maybe` (prompt #6).
- Why: ADR-004 and CLAUDE.md claimed an emulator-only demo project that was not actually configured. An explicit verification step in a prompt did not catch it, so I will check reported verification results against the files myself.

### 2026-10-19 16:16 – Open Firestore security rules from `firebase init` (repo review)
- What the AI produced: The default `firestore.rules` generated by `firebase init`: `allow read, write: if request.time < timestamp.date(2026, 11, 18);`
- What I checked: The rules file content after the review flagged it.
- What I changed / rejected: Replaced it with deny-all until real rules are written with the data model (prompt #6).
- Why: Generated defaults are not safe defaults – anyone could read and write all data. Permissive rules were listed as an expected AI/tooling risk from the start.

### 2026-10-19 16:16 – Prompt log outcome does not match the code (prompt #5)
- What the AI produced: The outcome of prompt #5 in prompts.md says the button changes the title to `Admin dashboard`.
- What I checked: The actual code in `admin-page.ts`: `this.title.update((t) => t += '!')`, which appends "!" on every click.
- What I changed / rejected: Logged the mismatch; the outcome text of #5 will be corrected. [FILL IN: was the code changed by hand afterwards, or did the AI describe it wrongly?]
- Why: A plausible-sounding outcome summary is not evidence. The log must describe what the code does, not what it was supposed to do.

### 2026-10-19 16:16 – Verified that `firestore-rules-author` exists (CLAUDE.md)
- What the AI produced: CLAUDE.md says Firestore security rules go through the `firestore-rules-author` subagent.
- What I checked: The official repo github.com/firebase/agent-skills – `agents/firestore-rules-author.md` exists.
- What I changed / rejected: Nothing; accepted.
- Why: A named tool or agent in AI-written instructions could be a hallucination; this one was verified.

### Part D – prompts.md

6. Log this prompt as #6 in process/prompts.md. Ask me for the timestamp – do not guess it.

When done: show me the full diff and list every remaining [FILL IN] placeholder in process/. Do not commit.
````

- **Outcome:** `.firebaserc` default project set to `demo-ping-me-maybe`; `firestore.rules` replaced with deny-all (`allow read, write: if false;`) plus the requested comment; ADR-007 reason copied from A2; four repo-review entries appended to `ai-review-log.md`; `admin-page.ts` untouched. Delegating the rules change to the `firestore-rules-author` subagent failed (its tool list uses another IDE's tool names, so Claude Code refused to spawn it with zero tools), so the dictated rule was written directly. Validation via the Firebase MCP rules validator was not possible (HTTP 403: the `demo-` project has no access to the cloud API).
- **Verdict:** accepted

### #7

- **Timestamp:** 2026-10-19 17:26
- **Tool:** Claude Code (WebStorm)
- **Prompt:**

````text
Read: CLAUDE.md, process/assumptions.md, process/scope.md,
process/decisions.md, the last two entries of process/ai-review-log.md,
and look at the files in fixtures/.

Do NOT write code and do NOT create any files yet. Propose the content
of a concise process/design.md (max. ~1.5 pages):

1. Firestore collections: events, rules, deliveries, sources.
   - fields with types,
   - document ID strategy,
   - a table of who can read / write (user on own documents, admin,
     Cloud Functions only).
2. TypeScript interface signatures: SourceAdapter, Event and the
   notification channel interface.
3. The pipeline as an ASCII diagram:
   poll → normalize → events create → trigger → match →
   deliveries create → send
   For each step: which Function (and its trigger type), how errors
   are handled, and where idempotency is guaranteed.

Give an explicit decision with a one-sentence reason for each of these:
- What should the events document ID be, given that externalId can be
  a URL (BBC guid) or a t3_… value (Reddit Atom <id>)?
- How does one parser handle both RSS 2.0 and Atom?
- Which new npm dependencies are needed (functions and frontend), and
  why those? Do not install anything, just list them.
- pollSourcesNow: onRequest or onCall, and how does it check the
  admin claim?
- Channel interface name: A12 says "ChannelAdapter", ADR-011 says
  "NotificationChannel". Which one?
- Does the source list live in Firestore or in code?

Mark where you deviate from scope.md or the ADRs, and where you made a
non-trivial decision. If you are unsure about something (e.g. a
Firebase API), say so instead of guessing.
````

  Follow-up: "i approve with timestamp 17:26"

- **Outcome:** Proposal in chat, then on approval: `process/design.md` (collections, access table, interfaces, pipeline, dependency list, open points) and ADR-013 in `decisions.md`. While reading the fixtures the AI found that BBC guids are not unique per story (`c60rl1xvjv89o#0` and `#3` in `bbc-business.xml`) and that 23 of 25 live Reddit entries have only link-post boilerplate in `<content>`; both shaped the design. Flagged as unverified: `firebase-functions` v7 import paths, `onCall` auth in the emulator, the `create()` error code, `fast-xml-parser` HTML-entity handling. Flagged as unsolved: demo step 6 (replay data is deduplicated). No dependencies installed, no code written.
- **Verdict:** accepted
