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

### OPEN – Reddit API access (to verify)

- **What the AI produced:** A warning that Reddit tightened API access in 2023 (rate limits, required User-Agent, OAuth for heavier use), explicitly marked as unverified.
- **What I checked:** [FILL IN: result of calling the public `.json` / `.rss` endpoints without auth]
- **What I changed / rejected:** [FILL IN]
- **Why:** Building on an unverified assumption about a third-party API is a typical AI-induced risk.
