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
