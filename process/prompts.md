# Prompt Log

Chronological log of every AI prompt used on this project, with its outcome and whether the result was accepted, changed or rejected.

Process-only fixes (log corrections, hashes, verdicts) are not logged as separate prompts; their changes are folded into the next entry.

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

- **Outcome:** Workflow test of Claude Code in WebStorm (title signal + button on the admin page). Not part of the product; code reverted in commit 14f08fa.
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

### #8

- **Timestamp:** 2026-10-19 17:53
- **Tool:** Claude Code (WebStorm)
- **Prompt:**

````text
Process-doc updates only. Do NOT write code, install anything or touch
fixtures/. Ask me for every timestamp before writing it (CLAUDE.md rule).

1. Keyword logic – my decision: a rule matches if the event's source is
   in rule.sourceIds AND ANY of rule.keywords appears in title+summary
   (case-insensitive). Keywords are OR-ed, not AND-ed.
   Reason: the demo rule "earthquake, flood" would almost never fire
   with AND; the M4 single-keyword test would not have caught this.
   - assumptions.md A7: replace "AND logic only" with the rule above,
     add an "Updated" header line.
   - design.md: fix the matcher filter in the pipeline diagram
     ("every keyword" → "any keyword").
   - scope.md: add an M2/M4 acceptance criterion:
     "A rule with several keywords matches when any one of them appears."
   - decisions.md: amend ADR-013 (or add ADR-014 if you think it is a
     separate decision – tell me which and why).

2. A12 in assumptions.md: rename ChannelAdapter → NotificationChannel,
   with a note "(renamed, ADR-013)". Add an "Updated" header line.

3. design.md factual fix: the live fixtures/reddit-nottheonion.xml has
   25 entries, of which only 1 is a self post with <div class="md">.
   Correct "23 of 25 … link posts" to "24 of 25". Verify it by reading
   the file, don't take my word for it.

4. design.md access table / rules notes: on create, rules.createdAt must
   equal request.time and userId must equal request.auth.uid; on update,
   createdAt and userId are immutable. Reason: the A5 filter
   (rule.createdAt < event.ingestedAt) depends on createdAt, so a client
   must not be able to backdate a rule.

5. ai-review-log.md – add two entries, leave my parts as [FILL IN]:
   a) BBC guid #N suffix (prompt #7): What the AI produced = the finding
      that c60rl1xvjv89o#0 and #3 are the same article; What I checked =
      [FILL IN]; What I changed = ADR-013 point 2; Why = raw guid would
      break S4.
   b) Keyword AND→OR (this prompt): What the AI produced = design.md
      matcher with AND over keywords; What I checked = the demo script
      in scope.md; What I changed = OR, per point 1; Why = [FILL IN].

6. Still open, do NOT solve now: demo step 6 (replay data is
   deduplicated). Leave it in design.md "Open points".

Log this prompt in prompts.md with the next number. When done, show me
a short summary of every file you changed – I review before committing.
````

  Follow-up: "write 17:53 in all"

- **Outcome:** A7 rewritten (keywords OR-ed, status Confirmed) and A12 renamed in `assumptions.md`; M4 criterion added in `scope.md`; `design.md` matcher fixed, `rules` write constraints added, Reddit count corrected; ADR-014 added (separate from ADR-013 because it changes the product meaning of "important", ADR-008/A7, and ADR-013 was already accepted); two `ai-review-log.md` entries with `[FILL IN]` parts. Point 3 verified with a script over the live fixture: 24 of 25 entries have no `<div class="md">`, but the split is 23 link posts (`<table>`) + 1 entry with only "submitted by" text (`t3_1x9a22q`) – the prompt #7 count of 23 was an AI miscount (only `<table>` entries were counted). Not changed: `fixtures/reddit-nottheonion.demo.xml` had uncommitted changes from outside this prompt; left untouched.
- **Verdict:** accepted

### #9

- **Timestamp:** 2026-10-19 18:02
- **Tool:** Claude Code (WebStorm)
- **Prompt:**

````text
7. ai-review-log.md, entry "2026-10-19 17:07 – Curated replay fixture
   for r/nottheonion": replace the two [FILL IN] parts with:
   - What I checked: Compared it with the live snapshot
     fixtures/reddit-nottheonion.xml. The <id> format (t3_…), date
     format and <content type="html"> matched. The link-post structure
     did not: live link posts have no <div class="md"> (only a table
     with "submitted by", [link] and [comments]), but the curated file
     wrapped "Submitted link." in an md div, which would have given
     link posts a made-up summary.
   - What I changed / rejected: Rewrote the two link-post entries
     (t3_pmm0001, t3_pmm0003) to the live structure; the two self-post
     entries keep their md div.

8. I have already replaced fixtures/reddit-nottheonion.demo.xml myself
   with the corrected version. Do not edit it, but read it and confirm
   that t3_pmm0001 and t3_pmm0003 have no <div class="md"> and that
   t3_pmm0002 and t3_pmm0004 do. Report any mismatch.
````

  Follow-ups: "#9 now", "#9 18:02"

- **Outcome:** Both `[FILL IN]` parts of the 17:07 review entry replaced with the given text; the existing "Kept it in addition to…" sentence kept. The fixture was read but not edited, and the check confirmed it: `t3_pmm0001` and `t3_pmm0003` have a `<table>` and no md div, while `t3_pmm0002` and `t3_pmm0004` have the md div. All four have `<content type="html">`, `t3_…` IDs and the live date format. No mismatch. Minor note, left as is: `t3_pmm0004` lacks the "submitted by" text that the live self post `t3_1x8qstr` has after its md div; it does not affect the summary (md div text only). The AI did not take a timestamp from the system clock because it showed 16:02, inconsistent with the 17:53 entries, and asked instead.
- **Verdict:** accepted

### #10

- **Timestamp:** 2026-10-19 18:15
- **Tool:** Claude Code (WebStorm)
- **Prompt:** Standing rule for process logs (Claude keeps them, verbatim decisions, timestamps, approvals, short entries) – add to CLAUDE.md. Follow-up: timestamp handling, fill `plan.md`, review-log voice, then continue with M3.
- **Decided by me:** "You keep the process logs, not me." / "If a prompt has none, write "time not given" and carry on – never block on it." / "Attribute checks to whoever did them: "Check (planning chat): …", "Check (IDE Claude, script): …", "Check (me): …". Use [FILL IN] only where the check really has to be mine." Reason not stated. Reason (added on 10-20): the process is graded as much as the code, and I cannot keep the logs by hand while reviewing and deciding.
- **Outcome:** Standing rule added to `CLAUDE.md` (Process rules), with the timestamp and review-voice refinements. `plan.md` filled from `scope.md` and the work schedule: status, time blocks, cut lines, risks, break rule; notes ~1 h schedule slip.
- **Verdict:** accepted

### #11

- **Timestamp:** ~2026-10-19 18:22 (from the commit time)
- **Tool:** Claude Code (WebStorm)
- **Prompt:** M3 – Ingestion, part 1: record the dependency approval (installed by hand 18:14), move `fixtures/` to `functions/fixtures/`, implement `parseFeed` (RSS + Atom, entities, BBC `#N` stripped, Reddit md-div summary), `ReplaySourceAdapter` and the source config in `functions/src/sources/`, Vitest tests on all four fixtures; no live adapter, poll or Firestore writes. "Run the tests, show me the results, then commit and push. Update plan.md with where we are and the next step (live adapter + poll)."
- **Outcome:** `git mv fixtures functions/fixtures`; references updated in `scope.md`, `design.md` and `CLAUDE.md` (folder tree), but not in historical entries (`decisions.md`, `ai-review-log.md`, `prompts.md`). Approval recorded in `design.md` §4. Added `types.ts`, `sources.ts`, `parse-feed.ts`, `html-text.ts`, `event-id.ts` (not requested, but the design's ID function, pure and testable), `replay-source-adapter.ts`, `parse-feed.test.ts`, and the `test` script (`vitest run --dir src`). 13 tests pass; tsc, lint and build are clean. Check (IDE Claude, mutation): removing the `#N` stripping fails 2 tests, and using the whole Reddit content as the summary fails 3. `parseFeed` also drops duplicate IDs within one feed: `bbc-business.xml` has 45 items and 43 events.
- **Verdict:** changed

### #12

- **Timestamp:** 2026-10-19 18:35
- **Tool:** Claude Code (WebStorm)
- **Prompt:** Stop and fix the process after commit 03d207f: reset #11's verdict to pending (and correct its summary if commit/push was not literally asked), add "Hard rules: git and scope" to CLAUDE.md, add an ai-review-log entry for the overstep, log this prompt, show the diff and stop. No commit, no push.
- **Decided by me:** "Verdicts are mine only." / "event-id.ts kept (ADR-013 needs it), but extras must be proposed, not implemented."
- **Outcome:** #11 verdict set to "[PENDING – my review]". #11 summary left unchanged: prompt #11 literally said "Run the tests, show me the results, then commit and push." Hard rules added to CLAUDE.md; review-log entry added with the given text. Not committed.
- **Follow-up (18:40):** #11 summary made literal; review-log wording corrected ("committed and pushed without showing me the test results first, as the prompt asked"); first hard rule replaced: "Never push – I push myself." `plan.md` left as is. #7–#10 verdicts kept as accepted – confirmed by me.
- **Verdict:** accepted

### #13

- **Timestamp:** 2026-10-19 18:55
- **Tool:** Claude Code (WebStorm)
- **Prompt:** Fill the remaining placeholders with the given text: ADR-007 date; the earthquake review entry (What I checked, Why, heading time 15:12 → 15:06); the prompt #5 mismatch entry; the BBC guid and keyword AND → OR entries; the `[hash]` in #5; the #12 follow-up wording. Log as #13, list leftover placeholders, show the diff and stop.
- **Outcome:** All nine points applied with the given text. Cited commits exist with matching times: 0c4cba2 (15:06), 6ec2664 (16:01), 14f08fa (16:35). Committed in 7bbc2ea after my OK.
- **Verdict:** accepted

### #14

- **Timestamp:** 2026-10-19 20:55
- **Tool:** Claude Code (WebStorm)
- **Prompt:** Restructure on a new branch `restructure-app`: `git mv` the Angular app (angular.json, package*.json, tsconfig*.json, src/, public/) into `app/`, next to `functions/`; reinstall in `app/`; fix paths in `.vscode/`, `.gitignore`, `firebase.json`, README, CLAUDE.md; verify builds/tests; ADR-015 (supersedes ADR-003); review-log entry on the "standard Firebase layout" claim; log as #14. Do not touch main, do not push, commit only after OK.
- **Decided by me:** "I prefer app/ and functions/ side by side – two separate programs, not one inside the other."
- **Outcome:** 22 files moved with `git mv` on `restructure-app`. Root `node_modules`, `dist/`, `.angular/` deleted; `npm install` in `app/`. Paths fixed in `.gitignore` (`/app/…`), `.vscode/tasks.json` (`path: app`, explicit labels so `launch.json` still resolves), README, CLAUDE.md; `firebase.json` has no Angular paths. `ng build` OK; `ng test` 1/2 – `app.spec.ts` "should render title" fails because `app.html` is only `<router-outlet />` since 39b10e4 (not caused by the move). Functions: build OK, 13/13 tests. ADR-015 date 2026-10-19 20:53 (given by me). Committed in cecd4c4 after my OK. app.spec.ts fixed in the same commit (router-outlet instead of h1); ng test 2/2.
- **Verdict:** accepted

### #15

- **Timestamp:** 2026-10-19 21:47
- **Tool:** Claude Code (WebStorm)
- **Prompt:** Unify code style on main: delete `functions/.prettierrc`; adjust `functions/.eslintrc.js` (`quotes` single, `object-curly-spacing` always, `max-len` 100) and only other rules that conflict with Prettier; format `functions/src` with the root Prettier; run lint, build, test; ADR-016; review-log entry on CRLF after `git restore`; log as #15. Commit only after OK, do not push.
- **Decided by me:** "I prefer the root Prettier style in functions/ too – one style across the repo."
- **Outcome:** `functions/.prettierrc` removed; three rules changed as given. One more Google rule conflicted: `quote-props` (`consistent-as-needed` vs Prettier `as-needed`) → set to `as-needed`. `linebreak-style` stays inherited from `google` (unix). Besides `functions/src`, `functions/.eslintrc.js` itself was also formatted with the root Prettier, because `npm run lint` checks it (31 errors otherwise). Lint clean, build OK, 13/13 tests. ADR-016 date 2026-10-19 21:43 (given by me). Committed in 88cc92a after my OK.
- **Verdict:** accepted

### #16

- **Timestamp:** 2026-10-19 22:15
- **Tool:** Claude Code (WebStorm)
- **Prompt:** Process fixes for #13–#15 and the CRLF entry time.
- **Outcome:** Committed in 0400614.
- **Verdict:** accepted – confirmed by me

### #17

- **Timestamp:** 2026-10-19 22:30
- **Tool:** Claude Code (WebStorm)
- **Prompt:** Tonight's step 1 (`todo-for-night.md`): `pollAllSources(db, adapters)` writing `events/{eventId}` with `create()` + `ingestedAt`, ALREADY_EXISTS = skipped (verify the code), `sources/{id}` status, per-source summary; `pollSourcesNow` onCall with the ADR-013 admin check and SOURCE_MODE (replay only), exported from index.ts (verify v7 import paths); `npm run poll:replay` dev script that refuses to run without FIRESTORE_EMULATOR_HOST and uses the `.firebaserc` project ID. Not now: live adapter, onSchedule, admin button, events rules. Run lint, build, tests; explain how to try it; update plan.md; log #16 and #17; add the app.spec.ts note to #14. Commit only after OK, do not push.
- **Decided by me:** "Tonight a thin, visible slice in 4 steps – see todo-for-night.md."
- **Outcome:** Added `functions/src/poll/poll-all-sources.ts`, `poll/adapters.ts` (`createAdapters(mode)`), `scripts/poll-replay.ts`; `index.ts` rewritten (scaffold comments removed; `initializeApp`, `pollSourcesNow`); `poll:replay` script in `functions/package.json`. Check (IDE Claude, installed typings): `create()` on an existing doc → `GrpcStatus.ALREADY_EXISTS` = 6 (exported by `firebase-admin/firestore`); firebase-functions 7.4.0 exports `onCall`/`HttpsError` from `firebase-functions/https` and `defineString` from `firebase-functions/params`. The Firebase skills cover neither, and the Firebase MCP server timed out. Lint clean, build OK, 13/13 tests; guard checked without FIRESTORE_EMULATOR_HOST (refuses, exit 1). Checked by me: 2× npm run poll:replay – first run created the events (visible in the Emulator UI), second run all skipped. Beyond the prompt, following design.md §1: `sources` also gets `name`, `category`, `lastSuccessAt`, `lastItemCount`, `lastNewCount`. No ADR: tonight's order changes the sequence, not the scope. Committed in 889695b after my OK.
- **Check (me):** 2× `npm run poll:replay`; first run created the events (visible in the Emulator UI), second run all skipped.
- **Verdict:** accepted – confirmed by me

### #18

- **Timestamp:** 2026-10-19 22:50
- **Tool:** Claude Code (WebStorm)
- **Prompt:** Commit step 1 (#17), no push. Add `functions/src/poll/poll-all-sources.test.ts` (Vitest, minimal fake Firestore in the test file): first run creates all, second run skips all (fake throws the same ALREADY_EXISTS), one failing adapter sets lastError while the other source is created, success sets lastError null and lastPolledAt. Say before changing `pollAllSources` for testability. Run lint, build, all tests; #17 verdict; log as #18. Commit #18 only after OK.
- **Outcome:** #17 committed in 889695b. Test file added with 4 cases; the fake implements only `collection().doc().create()/set({ merge })` and throws an error with `code: GrpcStatus.ALREADY_EXISTS`. No change to `pollAllSources` was needed: `serverTimestamp()` sentinels are compared with `isEqual`. Lint clean, build OK, 17/17 tests. Check (IDE Claude, mutation): turning off the ALREADY_EXISTS → skipped branch fails the second-run test. Committed in 9175d59.
- **Verdict:** accepted – confirmed by me

### #19

- **Timestamp:** 2026-10-19 23:05
- **Tool:** Claude Code (WebStorm)
- **Prompt:** Tonight's step 2, changed: `firebase` SDK in `app/` wrapped in `core/services`, connected to the Auth (9099) and Firestore (8080) emulators in dev; minimal emulator login + sign-out; `/admin/events` behind an `admin`-claim guard, newest 50 by `ingestedAt` (source, title link, published), signals; `firestore.rules`: `events` readable only with `admin == true`, rest deny-all, no rules tests tonight. Not now: rule form, user content on /alerts, matcher, poll button. Process fixes for #17/#18, re-plan step 2/3, log as #19. Run lint, build, all tests; explain how to try it. Commit only after OK, do not push.
- **Decided by me:** "Users cannot read events (design.md §1), so step 2 shows them on an admin page, and login moves forward from step 3."
- **Outcome:** `firebase` 13.0.0 installed in `app/`. npm 12 blocked its install scripts, but `@firebase/util` imports the `postinstall.mjs` that its script generates, so the script was read and allowed for that package only (`allowScripts` in `app/package.json`). New: `core/services/firebase.ts` (injection tokens; emulators via `isDevMode()`, project ID as in `.firebaserc`), `core/services/auth.ts` (email/password, A6; `admin` claim from the ID token), `core/services/events.ts` (`onSnapshot`, `orderBy('ingestedAt', 'desc')`, `limit(50)`), `core/models/event.ts`, `core/guards/admin-guard.ts` (non-admins → `/alerts`), `features/admin/admin-events-page.ts`. Sign-in form and sign-out in the app header (`app.ts`/`app.html`); `app.spec.ts` uses a fake `AuthService`. Unused scaffold `title` signal removed from `app.ts`. API names checked against the installed typings and the Firebase auth/firestore skills. Rules: the `firestore-rules-author` subagent again could not start (same tool-name mismatch as #6), so `firestore.rules` was written directly following `firestore-rules-creation`. Check (IDE Claude, emulator): the rules compile on the running Firestore emulator (PUT to its rules endpoint: 200; a deliberately broken copy: 400 "Unexpected ';'"). `ng build` OK with a budget warning (initial 812 kB > 500 kB warning, < 1 MB error); `ng test` 2/2; functions lint clean, build OK, 17/17 tests. The app has no lint script (no ESLint installed); Prettier is clean on the touched files. No ADR: the admin event list is already M5 in `scope.md`, so the scope does not change, only the order. Checked by me: login, admin claim via the Emulator UI, re-login, /admin/events lists the events. Committed in 32c2e8b (on `feature/tonight-step-2`) after my OK.
- **Verdict:** accepted – confirmed by me

### #20

- **Timestamp:** 2026-10-19 23:40
- **Tool:** Claude Code (WebStorm)
- **Prompt:** Small fix on /admin/events: sort by `publishedAt` (newest first) instead of `ingestedAt`, which is near-random for events from one poll; keep limit 50. Check that every parsed event has `publishedAt` (`orderBy` leaves out docs without it); ask before choosing a fallback. Update the heading text. #19: commit hash + verdict; log as #20. Run lint, build, app tests. Commit only after OK, do not push.
- **Outcome:** `events.ts`: `orderBy('publishedAt', 'desc')`, `limit(50)`; heading now says "by published time". Check (IDE Claude, code): `parseFeed` returns `null` for items without a valid date (`parse-feed.ts` RSS and Atom mappers), and `createEvent` writes the whole event, so every stored event has `publishedAt`; the parser tests assert a valid date on all four fixtures. No fallback needed. Single-field order → automatic index, no `firestore.indexes.json` change. Prettier clean on both files, `ng build` OK (same budget warning as #19), `ng test` 2/2. Committed in 03aeb83 after my OK.
- **Verdict:** accepted – confirmed by me

### #21

- **Timestamp:** 2026-10-20 00:16
- **Tool:** Claude Code (WebStorm)
- **Prompt:** Tonight's step 3 on `feature/tonight-step-3`: `core/models/rule.ts` + a constant list of the three sources (names from functions/ source config); `core/services/rules.ts` (`watchMine` with `where userId` + `orderBy createdAt desc`, `create`, `setActive`, `delete`, keyword normalization); `/alerts` page with signals: sign-in message, rule form (name, sources ≥1, comma-separated keywords ≥1, email checked, Slack disabled "coming later"), Firestore error text, list with pause/resume and delete with `confirm()`; `firestore.rules` for `rules` per design.md §1 (owner/admin read, validated create/update, owner delete, no admin writes); composite index (`userId` asc, `createdAt` desc). Not now: editing, matcher/email, `sources` from Firestore, admin rules view, rules tests, bundle budget. Run build, tests, Prettier; explain how to try it; log as #21. Commit only after OK, do not push.
- **Decided by me:** "Read from this constant, not from the `sources` collection. Design.md §1 gives users read access to `sources` for the rule form. I am deferring that, because those docs only exist after a poll."
- **Deviation from design.md §1:** the rule form reads `SOURCE_OPTIONS` in `app/src/app/core/models/sources.ts`, not the `sources` collection; `sources` stays denied by the catch-all. No ADR.
- **Outcome:** New: `core/models/sources.ts`, `core/models/rule.ts`, `core/services/rules.ts`; `features/alerts/alerts-page.ts` filled in (plain signals and template refs, no forms module); `firestore.rules` gets a `rules` block with an `isValidRule()` validator used by create and update; index added to `firestore.indexes.json`. Rules language limit: rules cannot loop over a list, so they do not check that each keyword is a non-empty string of bounded length; allowed values for `sourceIds`/`channels` use `hasOnly`. Noted in the rules header. Rules: the `firestore-rules-author` subagent was not tried again (still not starting, as in #19); written directly following `firestore-rules-creation`. Check (IDE Claude, emulator): the rules compile on the running Firestore emulator (PUT to its rules endpoint: 200; a deliberately broken copy: 400 "mismatched input '&&'"; then restored, 200). `ng build` OK (same budget warning, initial 825 kB); `ng test` 2/2; Prettier clean on the touched files (`firestore.indexes.json` only lacked its final newline). functions/ not touched. Check (IDE Claude, emulator script): a valid pause passes; after an extra field `foo` or an 81-char name is added with admin access, the same pause is denied with the same text, "PERMISSION_DENIED: evaluation error at L76:24 for 'update' @ L76, false for 'update' @ L87, …". L76:24 is the start of the whole update condition, so the text names the rule, not the failing check. The commit also contains my own small UI text/spacing edits in `app.html` and `alerts-page.ts` (Prettier clean). Also folds the process-only commits bc5a6e9, b0c3b73 and 43dd856. Committed in ab4b74e after my OK.
- **Check (me):** created a rule, paused/resumed it, deleted it; signed in as a second user and the first user's rule was not visible (~00:50).
- **Verdict:** accepted – confirmed by me

### #22

- **Timestamp:** 2026-10-20 00:56
- **Tool:** Claude Code (WebStorm)
- **Prompt:** Small fixes after my review of #21, on `feature/tonight-step-3`: `isValidRule()` – name not blank after `trim()` (80-char max stays on the untrimmed value), no duplicates in `sourceIds`/`channels` via `toSet().size()`; check both methods in the rules docs; header comment; emulator compile + script check. `alerts-page.ts`: replace the empty `<p></p>` spacers with component `styles`. Vitest for `normalizeKeywords`. Two items in `todo-for-night.md`. #21 Check (me), verdict, hash; tick `plan.md`. Run build, tests, Prettier. Commit only after OK, do not push.
- **Reason:** my review of #21 (planning chat).
- **Check (planning chat):** blank name and duplicate sourceIds/channels passed the rules; empty `<p>` used as spacers; `normalizeKeywords` untested.
- **Outcome:** Check (IDE Claude, docs): firebase.google.com/docs/reference/rules – `rules.String.trim()` "Returns a version of the string with leading and trailing spaces removed", `rules.List.toSet()` "Returns a set containing all unique elements in the list", `rules.Set.size()` exists; no workaround needed (the web-fetch tool only saw the sidebar, so the raw HTML was searched with curl). `firestore.rules`: the three checks added, header updated. Rules written directly following `firestore-rules-creation`, as in #21. Check (IDE Claude, emulator): rules compile (PUT: 200; broken copy: 400 "Unexpected '&&'"; restored, 200). Check (IDE Claude, emulator script, REST commit with server-time transforms, signed-in user): valid create ALLOWED, name `"   "` DENIED, `sourceIds` `['bbc-world', 'bbc-world']` DENIED; test doc deleted afterwards. `alerts-page.ts`: 4 spacers removed; `styles` makes the form's labels and fieldsets blocks with `margin-block: 1em`. New `core/services/rules.spec.ts` with the 4 cases. `todo-for-night.md` had no "Morning" section, so one was added holding the README item (the 11:30–13:00 slot is in `plan.md`). `ng build` OK (same budget warning, initial 825 kB); `ng test` 6/6; Prettier clean on the two TS files (it has no parser for `firestore.rules`; the process `.md` files were already not Prettier-formatted at HEAD and were left as they are). Folds the process-only fix for #21 (hash ab4b74e, Check (me), verdict). Committed in 5f260da after my OK.
- **Verdict:** accepted – confirmed by me

### #23

- **Timestamp:** 2026-10-20 01:09
- **Tool:** Claude Code (WebStorm)
- **Prompt:** Tonight's step 4 on `feature/tonight-step-4`: match → email in Mailpit. Install the approved `nodemailer` + `@types/nodemailer` (dev), report versions and blocked install scripts. Pure `matchRules` (active, source, `createdAt < ingestedAt` (A5), any keyword as case-insensitive substring (ADR-014), skip non-string/blank keywords); `matchEvent` (`onDocumentCreated('events/{eventId}')`, active rules, `deliveries/{eventId}_{ruleId}_{channel}.create()` pending, `ALREADY_EXISTS` = skip, one-line log); `sendDelivery` (`onDocumentCreated('deliveries/{deliveryId}')`, `pending → sending` transaction, send, `sent`/`failed`, never crash, missing channel → "channel not available"); `NotificationChannel` + `channelRegistry`, email only (Auth email via Admin SDK, Message-ID from the delivery ID, nodemailer with `defineString` `SMTP_HOST`/`SMTP_PORT`/`MAIL_FROM`, ~5 s timeouts); export both triggers; no `firestore.rules` change; Vitest for the matcher only. Check for Mailpit/Docker, give the start command and try-it steps. Fold the #22 process fixes. Run lint, build, tests. Commit only after OK, do not push.
- **Decided by me:** "I approve `nodemailer` + `@types/nodemailer` (dev) in `functions/` (design.md §4)."
- **Outcome:** Installed `nodemailer` **10.0.15** (pinned exact) and `@types/nodemailer` 8.0.2 (dev). Check (IDE Claude, npm registry): latest `nodemailer` 10.1.7 was published 2026-10-18 (2 days old, five releases that day), so the newest release older than two weeks was pinned instead. Neither package has an install/preinstall/postinstall script (nodemailer's `prepare` only runs for git installs); the install-scripts warnings were the already-blocked `@parcel/watcher`, `protobufjs`, `unrs-resolver`. New: `match/match-rules.ts` (pure, generic over the rule type), `match/match-event.ts` (`createDeliveries`, checks field types of event and rules), `notify/types.ts`, `notify/email-channel.ts`, `notify/channel-registry.ts`, `notify/send-delivery.ts` (`processDelivery`, loads the event for `publishedAt`), `shared/errors.ts` (`isAlreadyExists`/`errorMessage` moved out of `poll-all-sources.ts`, now shared). `index.ts` exports `matchEvent` and `sendDelivery`. Check (IDE Claude, typings): `onDocumentCreated` from `firebase-functions/firestore` and `defineString` from `firebase-functions/params` in the installed firebase-functions 7.4.0. **Deviation from design.md §2:** `channelRegistry` is `Partial<Record<ChannelId, NotificationChannel>>` until Slack exists. No ADR. Check (IDE Claude, test): the `florida` rule matches **two** entries of `reddit-nottheonion.demo.xml`, not one: t3_pmm0001 (title) and t3_pmm0002 (summary only), as the fixture header says; the test asserts both. Lint clean, `tsc` OK, Vitest 25/25 (8 new). Check (IDE Claude, script): compiled `lib/index.js` loads and exports `pollSourcesNow`, `matchEvent`, `sendDelivery`. Not tried against the emulator/Mailpit. Mailpit and Docker are not installed. Folds the process-only fix for #22 (hash 5f260da, verdict, review-log wording). Check (me): fresh emulator, `florida` rule (Reddit), `poll:replay` → 2 emails in Mailpit, 2 `sent` deliveries; second `poll:replay` → all skipped, no new email (~01:27). Committed in 7071941 after my OK.
- **Known limitation:** substring matching – `rain` matches "Ukraine". Word-boundary matching is a later option.
- **Verdict:** accepted – confirmed by me

### #24

- **Timestamp:** 2026-10-20 08:15
- **Tool:** Claude Code (WebStorm)
- **Prompt:** Morning step 1 on `feature/rules-tests`: security-rules tests for `events` and `rules` (M2 acceptance). Install the approved `@firebase/rules-unit-testing` (+ peer `firebase`, same major as `app/` if compatible) in `functions/`, newest release at least two weeks old, check install scripts. New `functions/rules-tests/`, separate `npm run test:rules`; `npm test` stays unit-only. Rules from `../firestore.rules`, project ID from `.firebaserc`, clear between tests, seed with `withSecurityRulesDisabled`. Cases for `events` read/write, `rules` create/read/update/delete and the catch-all (`deliveries`, `sources`). Stop before changing `firestore.rules`. Run lint, build, `npm test`, `npm run test:rules`, a mutation check. Fold the #23 process fixes; replace the morning time blocks in `plan.md`.
- **Decided by me:** "I approve `@firebase/rules-unit-testing` (dev) in `functions/`." Decided by me: "@firebase/rules-unit-testing 6.0.0 + firebase 13.0.0 as an exception to the two-week rule – 6.0.0 is 13 days old (one day short), it is the only release whose peer matches firebase 13.x, and firebase 13.0.0 from the same release has run in app/ since #19. 5.0.2 would put firebase 12 in functions/ and 13 in app/ for no gain, since the emulator evaluates the rules, not the SDK."
- **Outcome:** Check (IDE Claude, npm registry): 6.0.0 / `firebase` 13.0.0 are 13 days old; the newest two-week-old release (5.0.2) needs `firebase ^12` – IDE Claude stopped and asked (see `ai-review-log.md`). Installed both pinned exact (dev), `--ignore-scripts`; no install scripts in the added packages. **Deviation from design.md §4:** installed in `functions/`, not root (no root `package.json`; Vitest is already in `functions/`) – noted in §4. New `functions/rules-tests/firestore-rules.test.ts` (34 tests) and `tsconfig.rules-tests.json` (type-check only, added to the ESLint project list). `test:rules` = `tsc` type-check, then `firebase emulators:exec --only firestore` runs `vitest run --dir rules-tests`: one command, starts and stops its own emulator, no state left over (it fails if something already uses port 8080). No `firestore.rules` change: all tests passed on the existing rules. Lint clean, build OK, `npm test` 25/25, `npm run test:rules` 34/34. Check (IDE Claude, mutation): removed `createdAt == request.time` from the create rule → only "denies when createdAt is backdated (A5)" failed (33/34); `firestore.rules` restored with `git checkout`. Folds the process-only fix for #23 (Check (me), verdict, hash 7071941, review-log entry) and the new morning time blocks and cut line in `plan.md`. Committed in 2c5fb6c after my OK.
- **Verdict:** accepted – confirmed by me

### #25

- **Timestamp:** 2026-10-20 08:41
- **Tool:** Claude Code (WebStorm)
- **Prompt:** Morning step 2 on `feature/admin-seed`: admin claim seed script (A16). New `functions/src/scripts/grant-admin.ts`, `npm run admin:grant -- <email> [password]`: emulator-only guard on `FIREBASE_AUTH_EMULATOR_HOST`, project ID via a shared `defaultProjectId()` helper (moved out of `poll-replay.ts`), usage line on missing email, create the user only if missing and a password is given, ignore the password for an existing user, `{ ...existing, admin: true }`, no change if already admin, print uid + created/existed + sign-out reminder. README "make yourself admin" step, A16 wording. Fold the #24 process fixes. Run lint, build, unit tests, and the emulator cases if the Auth emulator runs. Commit only after OK, do not push.
- **Decided by me:** "The script creates the user if missing (email + password arguments), then grants the claim. The reviewer can then sign in directly as admin."
- **Outcome:** New `src/scripts/project-id.ts` (`defaultProjectId()` moved unchanged from `poll-replay.ts`, which now imports it) and `src/scripts/grant-admin.ts`; `admin:grant` script in `functions/package.json`. Check (IDE Claude, typings): `getUserByEmail`, `createUser(CreateRequest)`, `setCustomUserClaims(uid, object | null)`, `UserRecord.customClaims` and `FirebaseAuthError` (code `auth/user-not-found`) in the installed firebase-admin 13.10.0. The README had no run section, so a short "Make yourself admin" section was added after the intro (the full README rewrite stays in the 11:30 block). A16 names the script; status unchanged. Lint clean, build OK, `npm test` 25/25. Check (IDE Claude, script): without `FIREBASE_AUTH_EMULATOR_HOST` it prints the refusal and exits 1. Emulator cases not run at first: the Auth emulator was not running (port 9099 closed). Check (IDE Claude, emulator, during the #26 run-through, claims via the Auth emulator REST `accounts:lookup`): new email + password → created, `{"admin":true}`; same again → "already admin – nothing changed", exit 0; existing user + different password → "password argument was ignored", claim kept, sign-in with the old password OK, the new one `INVALID_PASSWORD`; unknown email, no password → "user not found – pass a password to create it", exit 1; no argument → usage line, exit 1; new email + `abc` → "The password must be a string with at least 6 characters.", exit 1, no user created. Test user deleted afterwards. No unit test for the script (thin glue over the Admin SDK; the emulator cases cover it). Folds the process-only fix for #24 (verdict, hash 2c5fb6c, `plan.md` tick). Also adds `process/chat-summaries/morning-handoff-prompt.md` (written by me, committed at my request). Committed in 6847904 after my OK.
- **Verdict:** accepted – confirmed by me

### #26

- **Timestamp:** 2026-10-20 09:07
- **Tool:** Claude Code (WebStorm)
- **Prompt:** Morning step 3 on `feature/admin-seed`: a "How to try it" quick start at the top of README.md (prerequisites, install once, start order, create users, demo flow, ports, after a restart, tests, troubleshooting), every command checked against the repo, PowerShell first plus bash where an env var is set. Run #25's skipped emulator cases during a run-through that follows the README from step 2 on a fresh emulator, check Mailpit's API, fix the README where a step fails, stop the emulators. Prettier on README.md. Process fix for #25 (hash). Commit only after OK, do not push.
- **Decided by me:** "Drop the generated Angular CLI boilerplate (scaffolding, e2e, resources); keep `ng build` / `ng test` in a short 'Development' section at the end. The big README rewrite and the two-Claudes note stay in the 11:30 block." On stopping the emulators that were already running: "Yes, stop them".
- **Outcome:** README rewritten around "How to try it locally"; the old "Make yourself admin" section is folded into "Create users". Checked against the repo: `engines.node` 24, npm 12.0.2 (`packageManager` in `app/`), `firebase --version` 15.34.0, Java minimum 21 (`MIN_SUPPORTED_JAVA_MAJOR_VERSION` in the installed firebase-tools), ports from `firebase.json` (UI on its default 4000, confirmed by the emulator banner), `SMTP_HOST`/`SMTP_PORT`/`MAIL_FROM`/`SOURCE_MODE` all have defaults (so the git-ignored `functions/.env.local` is not needed), "Create account" button in `app.html`. Check (IDE Claude, run-through): emulators were already running (not started by IDE Claude); stopped after my OK, fresh `firebase emulators:start` (3 functions loaded, all emulators ready), README `admin:grant` PowerShell line as written → admin created; `npm start` → app on 4200. Driving the app in Chrome did not work (sign-in worked and showed the admin "Events" link, but typing and clicks in the rule form did not register in two attempts), so the `florida` rule (Reddit, email) was created in the emulator with the Admin SDK, server timestamps. README `poll:replay` PowerShell line as written → 26/43/4 created; Mailpit API: 2 messages to admin@example.com ("[Florida] …"), 2 `sent` deliveries; second `poll:replay` → all skipped, still 2 messages. Emulator UI (4000) and `/admin/events` (4200) answer 200; the events page itself was not checked in the browser. The bash forms were not run as written. Emulators and dev server stopped afterwards. Only README change from the run-through: `npm test` / `npm run build` added next to `ng test` / `ng build` (`ng` needs a global Angular CLI). Prettier run on README.md. Folds the process-only fix for #25 (hash 6847904, emulator results). Changed after my review (09:15): Mailpit start command → `.\mailpit.exe --smtp 127.0.0.1:1025 --listen 127.0.0.1:8025` (bash form `./mailpit` with the same flags added by IDE Claude); then the two Mailpit blocks labelled "Windows (PowerShell)" and "macOS / Linux" after my review (09:15), then the same labels on the `admin:grant` and `poll:replay` blocks. Committed in aecf4bd after my OK. Check (me): followed the README myself: rule created in the app, 2 emails in Mailpit, events on `/admin/events` (~09:45).
- **Verdict:** accepted – confirmed by me

### #27

- **Timestamp:** 2026-10-20 09:31
- **Tool:** Claude Code (WebStorm)
- **Prompt:** Follow-up on `feature/admin-seed` after my planning-chat review of #26: review-log time and Why for the Mailpit entry, #25 verdict, #26 times / command / hash, Mailpit UI URL `http://127.0.0.1:8025` everywhere in the README, Prettier. Commit only after OK, do not push.
- **Decided by me:** "Mailpit is bound to 127.0.0.1, so use `http://127.0.0.1:8025` for the Mailpit UI everywhere". Reason: my planning-chat review of #26.
- **Outcome:** Check (planning chat): "review-log entry without a time and a Why; `.mailpit.exe` in the #26 Outcome; Mailpit UI URL `localhost` while the server binds to `127.0.0.1`." Review-log entry: heading 09:15, your Why; the backslash in `.\mailpit.exe` was also missing in its "What the AI produced" line and in your quote (double space kept), now restored. #25 verdict set. #26: both times 09:15, command as in the README, hash aecf4bd. README: Mailpit UI is `http://127.0.0.1:8025` in demo-flow step 4 and the ports table (the only two places); app and Emulator UI URLs unchanged. Prettier run on README.md. Committed in a60bd2a after my OK.
- **Verdict:** accepted – confirmed by me

### #28

- **Timestamp:** 2026-10-20 09:43
- **Tool:** Claude Code (WebStorm)
- **Prompt:** README "Ports and URLs" table: rename "App" to "App UI" and "Emulator UI" to "Firebase Emulator UI".
- **Decided by me:** "change: App -> App UI / change: Emulator UI ->  Firebase Emulator UI"
- **Outcome:** Both rows renamed in the table only; other mentions of "Emulator UI" in the README are unchanged. Prettier realigned the table. Follow-up in the same prompt: I asked why some rows use `http://localhost` and others `127.0.0.1`; IDE Claude explained (browser pages vs. ports; listen addresses) and recommended `127.0.0.1:4000` for the Emulator UI. Decided by me: "change mailpit to http://localhost:8025" and "add line: \"Rows with http:// open in a browser; the others are ports the code uses.\"" – Mailpit UI is `http://localhost:8025` in the table and in demo-flow step 4 (both places, to stay consistent; this reverses the #27 URL change), the line is added under the table. Check (IDE Claude, curl): `http://localhost:8025/` answers 200 with Mailpit bound to 127.0.0.1. Emulator UI recommendation not taken. Folds the process-only fix for #27 (hash a60bd2a). Committed in beed520 after my OK.
- **Verdict:** accepted – confirmed by me

### #29

- **Timestamp:** 2026-10-20 09:54
- **Tool:** Claude Code (WebStorm)
- **Prompt:** Morning step 4 on `feature/admin-view` from `main` (beed520): M5 admin view (A15). `deliveries` rule (owner or admin read, no client writes) + rules tests + mutation check; `DeliveriesService.watchLatest`, `RulesService.watchAll`; `/admin/rules` and `/admin/deliveries` (max 50, disabled "Disable" / "Retry" buttons, C4 / C2); `/admin` landing page, header link to `/admin`; Vitest spec for the delivery mapping; index check. Fold the #26 / #28 process fixes. Run all checks and an emulator check of `deliveries` reads; give try-it steps incl. a failed delivery. Fetch now is the next prompt. Commit only after OK, do not push.
- **Decided by me:** "The admin rules table shows the owner as uid; emails live only in Auth, and a lookup function is not worth it now." Decided by me: "No 'my deliveries' page for normal users now; the read-own rule is still added, as in design.md §1." On stopping the running emulators: "Yes, stop them".
- **Outcome:** `firestore.rules`: `deliveries` read if `isOwner(resource.data.userId) || isAdmin()`, no writes; header documents the delivery fields; `sources` still under the catch-all. Rules written directly following `firestore-rules-creation`, as in #21/#22. Check (IDE Claude, emulator): rules compile (PUT: 200; broken copy: 400 "mismatched input ';'"; restored, 200). Rules tests: new `deliveries` block (admin get + list, owner get, owner list `where userId ==`, other user, unfiltered non-admin list, signed-out, writes by owner and admin), seeded with the `createDeliveries` shape; the catch-all now uses `sources/bbc-world` and `users/alice`. App: `core/models/delivery.ts`, `core/services/deliveries.ts` (`watchLatest`, exported `toDelivery`), `RulesService.watchAll` (`watchMine` unchanged), `admin-rules-page.ts` (owner = first 8 chars of the uid, full uid in `title`), `admin-deliveries-page.ts` (error and "Retry" only on `failed` rows), `admin-page.ts` landing links, routes `rules` / `deliveries` under the existing `admin` parent (its `adminGuard` covers all children), header link "Admin" → `/admin`. `deliveries.spec.ts`: 3 cases for null / set `error` and `sentAt`. No spec for `watchAll`: the modular SDK's `collection()` checks for a real Firestore instance, so it needs the emulator or module mocking. Indexes: both new queries are a single-field `orderBy('createdAt', 'desc')` + `limit` with no `where`, so the automatic single-field index is enough; no change to `firestore.indexes.json` (the emulator does not enforce indexes, so this is from the query shape, not a test). Checks: functions lint clean (after a `func-call-spacing` fix in the new test), build OK, `npm test` 25/25, `npm run test:rules` 42/42 (emulators I did not start were stopped after my OK); `ng build` OK (same budget warning, initial 827 kB), `ng test` 9/9; Prettier clean on the touched app files and on the new test code (one pre-existing line in the rules test file, unchanged from HEAD, is not Prettier-formatted and was left as it is). Check (IDE Claude, mutation): owner condition dropped → exactly the two owner tests failed (40/42). The `git checkout` restore also removed the uncommitted `deliveries` block; re-applied and re-tested 42/42 (see `ai-review-log.md`). Check (IDE Claude, emulator, client SDK, fresh emulator): `admin:grant`, two users with rules created by the Admin SDK (alice: Reddit `florida` email; bob: BBC Business `bank` slack), `poll:replay` (26/43/4) → 2 `sent`, 3 `failed` with `Channel "slack" not available`. Admin: deliveries list with `orderBy` + `limit` ALLOWED (5), rules `watchAll` query ALLOWED (2); alice: get own ALLOWED, list `where userId ==` ALLOWED (2), unfiltered list and the admin-style query DENIED; bob: get alice's delivery DENIED, rules `watchAll` query DENIED. Try-it flow from the prompt: a second `poll:replay` after a new rule creates nothing (see `ai-review-log.md`); after deleting the events it works (21 new deliveries, 5 old ones skipped). Emulators stopped afterwards; Mailpit and `ng serve` were left running and Mailpit was not stopped (so the SMTP-failure text was not seen). Folds the process-only fixes for #26 (Check (me)) and #28 (heading time, Why, hash beed520). Changed after my review (10:15): the two review-log Whys filled in with my text. Decided by me: "yes, include my plan.md line in this commit" (the rule-editing line in `plan.md` is mine). Decided by me: "yes, show source display names (from `SOURCE_OPTIONS`) instead of IDs on /admin/rules – and /admin/deliveries if it shows source IDs too" – `/admin/rules` now shows names (unknown ID shown as it is); `/admin/deliveries` has no source column, so no change there. `ng build` OK (same budget warning), `ng test` 9/9, Prettier clean. The commit also contains my own edit: an "Alerts" link in the admin header (`app.html`). Check (me): first poll gave no email – the events were already there before my rule (A5 + dedup); deleting `events` in the Emulator UI and polling again fixed it (~10:20). Admin pages checked in the browser: events, my `florida` rule with the source name, 2 `sent` deliveries, disabled "Disable" button; a normal user is redirected from `/admin` to `/alerts` (~10:25). Then a normal user's `florida` rule, `events` and `deliveries` deleted in the Emulator UI, `poll:replay` → 4 emails in Mailpit, 2 for the admin and 2 for the user, 4 `sent` rows (~10:28). Committed in c446273 after my OK.
- **Verdict:** accepted – confirmed by me

### #30

- **Timestamp:** 2026-10-20 10:32
- **Tool:** Claude Code (WebStorm)
- **Prompt:** Docs-only follow-up on `feature/admin-view` after my browser checks of #29: #29 time, hash, Check (me), verdict; review-log entry for the README "no email" gap; README (admin pages in the demo flow, troubleshooting line, optional failed-delivery step, idempotency line); `design.md` §5 demo step 6 resolved, `scope.md` demo step 6 wording; `plan.md` M5 / M6 children; list leftovers in the process files. No code changes. Commit only after OK, do not push.
- **Outcome:** #29: review time 10:15, Check (me), hash c446273, verdict set as given. New review-log entry 10:20 with the given text. README: step 5 lists `/admin/events`, `/admin/rules`, `/admin/deliveries`; new optional step 6 "failed delivery"; idempotency line (S4); "admin deliveries view" removed from "Not in the demo yet"; troubleshooting bullet "No email and no delivery" added below the existing "No email" bullet (two different causes). Prettier run on README.md. `design.md` §5 item resolved; `scope.md` demo step 6 reworded. `plan.md`: M5 ticked as given, M6 open, parent unticked. **Deviation:** the failed-delivery step as written gives no `failed` rows – re-created events keep their IDs, so the existing rule's deliveries are skipped; IDE Claude added "create another rule" to the README, `design.md` and `scope.md` (see `ai-review-log.md`). Leftover search (`[FILL IN]`, `time not given`, `Reason not stated`, `[PENDING`): nothing from today except #29 (fixed here) and the Why of the new 10:32 review-log entry; older hits: #10 "Reason not stated" (my reason appended) and #11 "time not given" (now ~18:22 from commit 03d207f), both after my review; quoted mentions in old prompts and chat summaries not changed.
- **Verdict:** accepted – confirmed by me
