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

### 2026-10-19 15:12 – Earthquake source dropped (Phase 1)

- **What the AI produced:** A pre-roadmap with the USGS earthquake feed as the one real source.
- **What I checked:** [FILL IN: what I looked at when deciding]
- **What I changed / rejected:** Dropped USGS; chose BBC RSS + Reddit as real sources (ADR-007).
- **Why:** [FILL IN: my reason – same as ADR-007]

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
- **What I changed / rejected:** Logged the mismatch; the outcome text of #5 will be corrected. [FILL IN: was the code changed by hand afterwards, or did the AI describe it wrongly?]
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
- **What I checked:** [FILL IN]
- **What I changed / rejected:** ADR-013 point 2: BBC `externalId` = guid with the trailing `#N` suffix stripped.
- **Why:** Using the raw guid as the dedup key would create two events for one story and send two notifications – it would break S4.

### 2026-10-19 17:53 – Keyword matching AND → OR (prompt #8)

- **What the AI produced:** `design.md` (prompt #7) with the matcher filter "every keyword in title+summary", i.e. AND over keywords, following A7.
- **What I checked:** The demo script in `scope.md`: the rule "BBC World, keywords `earthquake, flood`".
- **What I changed / rejected:** Keywords are OR-ed (ADR-014); A7, `design.md` and `scope.md` (M4) updated.
- **Why:** [FILL IN]
