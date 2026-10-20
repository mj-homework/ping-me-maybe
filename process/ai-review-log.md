# AI Review Log

Record of how AI-generated output was reviewed: what was checked, and what was changed or rejected and why.

## Template

```markdown
### YYYY-MM-DD HH:mm – Short title (prompt #N)

- **What the AI produced:**
- **What I checked:**
- **What I changed / rejected:**
- **Why:**
```

---

### 2026-10-19 13:39 – Proposed `web/` folder vs. actual layout (planning chat)

- **What the AI produced:** A repo layout with the Angular app in a `web/` subfolder next to `api/` and `process/`.
- **What I checked:** The actual result of the Angular CLI in WebStorm: the app was generated at the repo root.
- **What I changed / rejected:** Rejected the `web/` subfolder; kept Angular at the root with `functions/` next to it (ADR-003).
- **Why:** Root + `functions/` is the standard Firebase layout; moving the app would only cause config churn with no benefit.

### 2026-10-19 13:57 – Scheduled functions in the emulator (planning chat)

- **What the AI produced:** A design relying on a scheduled Cloud Function to poll sources.
- **What I checked:** Whether the Functions emulator actually runs scheduled functions on their own timer – it does not.
- **What I changed / rejected:** Added an HTTP function `pollSourcesNow` with an admin "Fetch now" button that shares the polling logic (ADR-005).
- **Why:** Without it, the core pipeline could not be demonstrated in the emulator-only setup.

### 2026-10-19 14:30 – ADR timestamps (prompt: timestamp update)

- **What the AI produced:** ADR entries with date-only or no timestamps.
- **What I checked:** Whether the decision log reflects the real timeline of the work.
- **What I changed / rejected:** Supplied exact `YYYY-MM-DD HH:mm` values myself instead of letting the AI generate them; added the rule "Never guess a timestamp – ask me" to `CLAUDE.md`.
- **Why:** An AI will happily invent plausible timestamps; a fabricated timeline would undermine the whole process log.

### 2026-10-19 15:06 – Earthquake source dropped (Phase 1)

- **What the AI produced:** A pre-roadmap with the USGS earthquake feed as the one real source.
- **What I checked:** No separate check – a judgement call on how often a relevant earthquake happens.
- **What I changed / rejected:** Dropped USGS; chose BBC RSS + Reddit as real sources (ADR-007).
- **Why:** Earthquakes are too rare (fortunately) – unlikely to produce a relevant event during a demo (same as ADR-007).

### 2026-10-19 15:17 – Preventing invented reasons in ADRs (prompt: BBC/Reddit ADRs)

- **What the AI produced:** Draft ADR-007…010 text.
- **What I checked:** Which parts of the ADRs are facts only I know (when and why I dropped earthquakes).
- **What I changed / rejected:** Put literal `[FILL IN]` placeholders in the prompt and instructed the AI not to fill them.
- **Why:** The reason for a decision has to be mine; an AI-generated rationale would look plausible but be fabricated.

### 2026-10-19 15:21 – MoSCoW user stories: channel order (planning chat)

- **What the AI produced:** A Must list with email and Slack as parallel stories, and a third channel as Should.
- **What I checked:** Whether parallel channels actually prove the "add more channels later" requirement.
- **What I changed / rejected:** Made Slack depend on email working end-to-end; the Slack commit must not touch matcher/dispatcher code; third channel moved to Could (ADR-011).
- **Why:** Email validates the pipeline; Slack added as an isolated adapter is concrete evidence of extensibility instead of a claim.

### 2026-10-19 15:51 – Cross-check of scope.md against assumptions.md (second AI tool)

- **What the AI produced:** `scope.md` (planning chat, 15:31) that had drifted from the confirmed Phase 1 assumptions: different sources (r/worldnews, r/news, r/stocks instead of r/nottheonion), Slack as a Must despite A11 deferring it, no mention of the disabled admin actions (A15), a Reddit min. score condition that RSS cannot support, ADR-009 cited for two unrelated things, and no acceptance criterion for A5.
- **What I checked:** Had a second AI tool review `scope.md` against `assumptions.md`, then decided the conflicting points myself.
- **What I changed / rejected:**
  - Sources: BBC World + BBC Business + r/nottheonion (A2 extended with BBC World to cover all three brief categories).
  - Slack moved from Must (M5) to Should (S1), still gated behind email (ADR-011); demo and cut lines adjusted.
  - Disabled admin write actions added to scope; enabling them tracked as C2–C4.
  - Reddit min. score moved to Could (C5); rules are keyword-only. ADR-009 now refers only to dedup.
  - Added acceptance criterion: creating a rule does not alert on already-ingested events (A5).
  - Event shape in scope aligned with A3.
- **Why:** The scope is a commitment built on the assumptions; a silent drift between the two documents means the plan no longer reflects my decisions.

### 2026-10-19 16:16 – `.firebaserc` without the demo project ID (repo review)

- **What the AI produced:** `firebase init` output plus the scaffolding prompt (#1), whose step 1 was to verify that `.firebaserc` contains `demo-ping-me-maybe` and report any difference.
- **What I checked:** A repo review in the planning chat flagged `.firebaserc` as `{}`; I confirmed it in the file.
- **What I changed / rejected:** Set the default project to `demo-ping-me-maybe` (prompt #6).
- **Why:** ADR-004 and CLAUDE.md claimed an emulator-only demo project that was not actually configured. An explicit verification step in a prompt did not catch it, so I will check reported verification results against the files myself.

### 2026-10-19 16:16 – Open Firestore security rules from `firebase init` (repo review)

- **What the AI produced:** The default `firestore.rules` generated by `firebase init`: `allow read, write: if request.time < timestamp.date(2026, 11, 18);`
- **What I checked:** The rules file content after the review flagged it.
- **What I changed / rejected:** Replaced it with deny-all until real rules are written with the data model (prompt #6).
- **Why:** Generated defaults are not safe defaults – anyone could read and write all data. Permissive rules were listed as an expected AI/tooling risk from the start.

### 2026-10-19 16:16 – Prompt log outcome does not match the code (prompt #5)

- **What the AI produced:** The outcome of prompt #5 in prompts.md says the button changes the title to `Admin dashboard`.
- **What I checked:** The actual code in `admin-page.ts`: `this.title.update((t) => t += '!')`, which appends "!" on every click.
- **What I changed / rejected:** Logged the mismatch; the outcome text of #5 will be corrected. Not known any more. Git cannot tell either: the code (appends "!") and the "Admin dashboard" outcome were first committed together in 6ec2664 (16:01).
- **Why:** A plausible-sounding outcome summary is not evidence. The log must describe what the code does, not what it was supposed to do.

### 2026-10-19 16:16 – Verified that `firestore-rules-author` exists (CLAUDE.md)

- **What the AI produced:** CLAUDE.md says Firestore security rules go through the `firestore-rules-author` subagent.
- **What I checked:** The official repo github.com/firebase/agent-skills – `agents/firestore-rules-author.md` exists.
- **What I changed / rejected:** Nothing; accepted.
- **Why:** A named tool or agent in AI-written instructions could be a hallucination; this one was verified.

### 2026-10-19 16:59 – Reddit RSS access verified (curl)

- **What the AI produced:** A warning that Reddit tightened API access in 2023 (rate limits, required User-Agent, OAuth for heavier use), explicitly marked as unverified. *(Was the OPEN item in this log.)*
- **What I checked:** `curl` against the three feeds from my machine:
  - BBC World (`https://feeds.bbci.co.uk/news/world/rss.xml`) and BBC Business (`https://feeds.bbci.co.uk/news/business/rss.xml`): `200 text/xml`, with or without a User-Agent.
  - r/nottheonion (`https://www.reddit.com/r/nottheonion/.rss`): **`403` without a User-Agent**, **`200 application/atom+xml` with a custom User-Agent**. The response is **Atom**, not RSS 2.0.
- **What I changed / rejected:**
  - The source adapter always sends a custom User-Agent (`PingMeMaybe/0.1 (+repo URL)`).
  - The feed parser must handle both RSS 2.0 (`<item>`) and Atom (`<entry>`).
  - Reddit stays a live source; no OAuth needed at demo polling rates.
  - Corrected the "all feeds are plain RSS / one input format" claim in `scope.md` and `assumptions.md` (A2). ADR-012 point 1 states the same and is amended in `decisions.md`.
- **Why:** The AI warning was right about the User-Agent, but my own scope's "all plain RSS" claim was wrong – only a real request showed it.

### 2026-10-19 17:07 – Curated replay fixture for r/nottheonion (planning chat)

- **What the AI produced:** A hand-made Atom fixture `fixtures/reddit-nottheonion.demo.xml` with four fictitious entries: keyword in the title, keyword only in the content (lower case), no keyword, and HTML entities in the title/content.
- **What I checked:** Compared it with the live snapshot `fixtures/reddit-nottheonion.xml`. The `<id>` format (`t3_…`), date format and `<content type="html">` matched. The link-post structure did not: live link posts have no `<div class="md">` (only a table with "submitted by", `[link]` and `[comments]`), but the curated file wrapped "Submitted link." in an md div, which would have given link posts a made-up summary.
- **What I changed / rejected:** Kept it **in addition to** the live snapshot, not instead of it: the live snapshot is the shape reference for the parser test; the curated file only provides deterministic match / no-match cases for the matcher tests and the demo (`florida` rule in the demo script). Rewrote the two link-post entries (`t3_pmm0001`, `t3_pmm0003`) to the live structure; the two self-post entries keep their md div.
- **Why:** ADR-010 rejected hand-written fake data as the *only* test data because it would not reflect real feed shapes. A live snapshot cannot guarantee a `florida` item exists, so the demo and matcher tests need a controlled file – but its shape must be checked against the real feed, not trusted.

### 2026-10-19 17:53 – BBC guid `#N` suffix is not a stable ID (prompt #7)

- **What the AI produced:** While reading the fixtures for `design.md`, the finding that `fixtures/bbc-business.xml` contains the same article twice: `…/articles/c60rl1xvjv89o#0` and `…#3`, same title and `pubDate`.
- **What I checked:** Check (planning chat, 2026-10-19 18:50): in functions/fixtures/bbc-business.xml both items have the same title, description, link, pubDate and thumbnail – only the guid suffix differs (#0 vs #3).
- **What I changed / rejected:** ADR-013 point 2: BBC `externalId` = guid with the trailing `#N` suffix stripped.
- **Why:** Using the raw guid as the dedup key would create two events for one story and send two notifications – it would break S4.

### 2026-10-19 17:53 – Keyword matching AND → OR (prompt #8)

- **What the AI produced:** `design.md` (prompt #7) with the matcher filter "every keyword in title+summary", i.e. AND over keywords, following A7.
- **What I checked:** The demo script in `scope.md`: the rule "BBC World, keywords `earthquake, flood`".
- **What I changed / rejected:** Keywords are OR-ed (ADR-014); A7, `design.md` and `scope.md` (M4) updated.
- **Why:** Suggested by the AI in the planning chat; I agreed because the demo rule "earthquake, flood" would almost never fire with AND, and the M4 single-keyword test would not have caught it.

### 2026-10-19 18:35 – IDE Claude overstepped on commit 03d207f (prompt #11)

- **What the AI produced:** Commit 03d207f – prompts #10 and #11 bundled, committed and pushed without showing me the test results first, as the prompt asked, self-set verdict "accepted" on #11, `plan.md` saying "committed and pushed" inside that same commit, unrequested `event-id.ts`.
- **What I checked:** Check (planning chat): `git log` / `git show` of 03d207f against `prompts.md` and `plan.md`.
- **What I changed / rejected:** Verdict reset to pending; hard rules for git, verdicts and scope added to CLAUDE.md. `event-id.ts` kept (ADR-013 needs it), but extras must be proposed, not implemented.
- **Why:** The process log is graded; an AI-written "accepted" or "done" that I never confirmed makes the log untrustworthy.

### 2026-10-19 20:55 – ADR-003 'standard Firebase layout' claim (planning chat)

- **What the AI produced:** ADR-003 and the 13:39 review entry justified keeping Angular at the root as "the standard Firebase layout".
- **What I checked:** Check (planning chat, 2026-10-19 20:53): firebase.google.com/docs/functions/organize-functions – it fixes `firebase.json` at the root and `functions/` source folders, nothing about the frontend location.
- **What I changed / rejected:** ADR-015 – Angular moved to `app/`.
- **Why:** The claim was presented as fact but was only how `firebase init` happened to lay out this repo.

### 2026-10-19 21:33 – CRLF line endings after git restore (Windows) (prompt #15)

- **What the AI produced:** nothing – a tooling issue found while reviewing a formatting change.
- **What I checked:** Check (me): `npm run lint` after `git restore` – 124 linebreak-style errors; git wrote CRLF on Windows (`core.autocrlf`).
- **What I changed / rejected:** added `.gitattributes` with `* text=auto eol=lf` (635475b); `lint --fix` restored LF.
- **Why:** reviewers on Windows would hit the same lint failure.

### 2026-10-19 23:05 – `firebase` install script blocked by npm 12 (prompt #19)

- **What the AI produced:** `npm install firebase` in `app/`.
- **What I checked:** Check (IDE Claude, files): npm 12 skipped all install scripts; `@firebase/util/dist/index.esm.js` imports `./postinstall.mjs`, which only its postinstall script generates, so the bundle would break without it. Script read first: without `FIREBASE_WEBAPP_CONFIG` it only writes two files returning `undefined`, no network.
- **What I changed / rejected:** `npm install-scripts approve @firebase/util` – only that package (`allowScripts` in `app/package.json`); the other blocked scripts (`msgpackr-extract`, `protobufjs`) stay off.
- **Why:** Only the one script the bundle needs; the others stay blocked to keep install-time code minimal.

### 2026-10-20 00:56 – Gaps in the #21 rule form and rules (prompt #22)

- **What the AI produced:** `isValidRule()` in `firestore.rules`, `alerts-page.ts` and `normalizeKeywords` (prompt #21); the empty `<p>` spacers were my own edit, not AI output.
- **What I checked:** Check (planning chat): blank name and duplicate sourceIds/channels passed the rules; empty `<p>` used as spacers; `normalizeKeywords` untested.
- **What I changed / rejected:** `trim()` and `toSet()` checks in the rules (emulator script: blank name and duplicate sourceId denied); spacers replaced with component `styles`; Vitest for `normalizeKeywords` (prompt #22).
- **Why:** The rules are the only real guard: a blank-named or duplicate-source rule would reach the matcher and the admin view. Spacing belongs in CSS, not empty elements. `normalizeKeywords` decides what the matcher compares, so it needs a test.

### 2026-10-20 01:09 – nodemailer version and the `florida` count (prompt #23)

- **What the AI produced:** the #23 matcher, triggers and email channel.
- **What I checked:**
  - Check (IDE Claude, npm registry): `nodemailer@latest` (10.1.7) was 2 days old.
  - Check (IDE Claude, test): the `florida` rule matches two demo entries (title + summary-only), not one.
  - Check (planning chat): reviewed the diff, including the `shared/errors.ts` extraction.
- **What I changed / rejected:** kept the exact pin to 10.0.15; kept the two-entry test; the "exactly one" in my prompt was wrong (the fixture header already says two).
- **Why:** a 2-day-old release with five publishes in one day is a supply-chain risk, and a two-week-old version is enough for SMTP to Mailpit. The test should follow the fixture, not my prompt.

### 2026-10-20 08:15 – `@firebase/rules-unit-testing` version vs. the two-week rule (prompt #24)

- **What the AI produced:** nothing yet – a registry check before installing found a conflict in the prompt's version rules.
- **What I checked:**
  - Check (IDE Claude, npm registry): `@firebase/rules-unit-testing` 6.0.0 (the only release with peer `firebase ^13`) and `firebase` 13.0.0 were published 2026-10-07, 13 days old. The newest release at least two weeks old, 5.0.2 (2026-08-19), needs `firebase ^12`, not the app's 13.x. Neither package has install scripts.
  - Check (IDE Claude, npm audit): 29 moderate before, 34 (29 moderate, 5 high) after; the 5 high come from `@grpc/grpc-js` ≤1.13.5 under the `firebase` client SDK (dev-only, talks to the local emulator).
- **What I changed / rejected:** IDE Claude stopped and asked. Decided by me: "6.0.0 + firebase 13.0.0" – both pinned exact (dev), one day short of the two-week rule.
- **Why:** @firebase/rules-unit-testing 6.0.0 + firebase 13.0.0 as an exception to the two-week rule – 6.0.0 is 13 days old (one day short), it is the only release whose peer matches firebase 13.x, and firebase 13.0.0 from the same release has run in app/ since #19. 5.0.2 would put firebase 12 in functions/ and 13 in app/ for no gain, since the emulator evaluates the rules, not the SDK.

### 2026-10-20 09:15 – Mailpit start command in the README (prompt #26)

- **What the AI produced:** README step 3.1 started Mailpit as plain `.\mailpit.exe` / `./mailpit`, relying on its default ports.
- **What I checked:** Check (me): reviewed the README.
- **What I changed / rejected:** Decided by me: "in the readme, how to start mailpit: `.\mailpit.exe  --smtp 127.0.0.1:1025 --listen 127.0.0.1:8025`". IDE Claude added the bash form with the same flags. Then: "mailpit show somehow which is win/mac" – the two blocks are now labelled "Windows (PowerShell)" and "macOS / Linux". Then: "4. Create users - why 2 very similar rows? win/mac again?" – the same labels added to the `admin:grant` and `poll:replay` blocks.
- **Why:** Explicit flags make the ports visible in the README and bind Mailpit to this machine only; the OS labels tell the reader which block to copy.
