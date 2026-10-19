# Planning Chat Summary — Ping Me Maybe

> **Tool:** Claude (claude.ai, planning/advisor chat — separate from the IDE Claude Code used for implementation)
> **Date:** 2026-10-19, 13:15 – 14:35 (Europe/Budapest)
> **Purpose:** Turn the vague brief into a plan of attack, pick the stack, set up the repo and the process documentation *before* writing any feature code.

---

## 1. The brief (as received)

> "We want users to be able to set up alerts so they get notified when something important happens in the world — like breaking news, market movements, natural disasters, that kind of thing. Should work for both email and Slack. Make it flexible enough that we can add more channels later. We need an admin view too."

**Key insight from the task description:** the evaluation is about the **process** (framing, decisions, course-corrections, validation of AI output), not the code itself. Everything below is set up to leave a visible trail.

---

## 2. Pre-roadmap (approx. 24h)

| Phase | Time | Content |
|---|---|---|
| 0. Repo & process scaffolding | ~30 min | Repo, `process/` folder (prompts, decisions, AI review log), first commit early |
| 1. Disambiguate the brief | 1.5–2h | List open questions as if asking the PM; record an explicit assumption for each |
| 2. Scope the MVP | ~1h | In: user-defined rules, 2–3 sources, matcher, email + Slack, pluggable channels, admin view. Out: ML "importance" scoring, advanced auth, scaling |
| 3. Design | 2–3h | Domain model `Source → Event → AlertRule → Match → Delivery → Channel`; pipeline: ingestion → normalize → match → dispatch → channel adapters |
| 4. Vertical slice build | 8–10h | Backend core → matcher (+ tests) → channels → user UI → admin UI; commit per milestone |
| 5. Validation | 2–3h + continuous | Actively hunt typical AI failures; log every catch |
| 6. Write-up | ~2h | README, architecture, assumptions, retrospective |

**Expected AI failure modes to watch for:** invented API endpoints/fields, Slack API misuse, missing idempotency/dedup, fake "importance" logic, over-engineering, tests that only test mocks, permissive security rules, invented timestamps.

---

## 3. Decisions made

| ADR | Date (Budapest) | Decision | Reasoning / rejected alternatives |
|---|---|---|---|
| — | 2026-10-19 13:24 | App name: **Ping Me Maybe** | Memorable, playful; alternatives considered: Alert shop, Alertbook, Alerter, Chicken Little, Heads Up, Canary |
| 001 | 2026-10-19 13:27 | **Single Angular app**, admin as lazy-loaded `/admin` route behind a role guard | Brief says "admin *view*", not "admin app". Rejected: Nx monorepo (setup cost), Angular multi-project workspace (premature) |
| 002 | 2026-10-19 13:30 | **Firebase** backend (Auth, Firestore, Cloud Functions), **emulator-first** | Speed, native Angular integration (AngularFire). Trade-offs: vendor lock-in, limited querying → matching done in-function, at-least-once triggers → idempotent delivery IDs |
| 003 | 2026-10-19 13:39 | Angular app **stays at repo root** (no `web/` subfolder) | Course-correction: app was generated at root; this is the standard Firebase layout, moving it = churn |
| 004 | 2026-10-19 13:41 | Project ID **`demo-ping-me-maybe`** (no Firebase console project) | Emulator-only: no billing, no credentials, cannot touch real cloud resources. Real project can be attached later via `firebase use --add` |
| 005 | 2026-10-19 13:57 | Add HTTP function **`pollSourcesNow`** + admin "Fetch now" button | Functions emulator does not run scheduled functions automatically; also makes demos reproducible |
| 006 | 2026-10-19 14:02 | Install official **Firebase agent skills** for Claude Code | Reduce outdated/hallucinated Firebase API usage; generated code still reviewed |
| — | 2026-10-19 14:25 | Host repo under GitHub org **`mj-homework`** | Keep homework separate from personal account |
| — | 2026-10-19 14:30 | All process log entries use **`YYYY-MM-DD HH:mm`** (Europe/Budapest) | Precise timeline; AI must never guess timestamps |

---

## 4. Firebase mapping

| Need | Firebase piece |
|---|---|
| Users / login | Firebase Auth |
| Admin role | Custom claim `admin: true` + route guard + security rules |
| Data (alerts, events, deliveries) | Firestore |
| Polling sources | Scheduled function + `pollSourcesNow` HTTP function |
| Matching & dispatch | Firestore trigger on `events/{id}` create |
| Email | Function + nodemailer → Mailpit / Ethereal locally |
| Slack | Function → Slack incoming webhook (`fetch`) |
| Runtime | Emulator Suite (Auth, Functions, Firestore + UI) |

**Risks identified up front:**
1. Blaze plan required for deployed Functions → mitigated by emulator-only demo project.
2. At-least-once triggers → duplicate notifications → deterministic delivery IDs `{eventId}_{ruleId}_{channel}` + `create()`.
3. AI tends to write permissive security rules → owner-only alerts, admin-only deliveries, function-only event writes; test with emulator rules tests.
4. Firestore can't do complex matching queries → load active rules, match in memory.
5. Secrets (Slack webhook) → never hardcoded, `.env` / `defineSecret`.

---

## 5. Setup steps performed

1. Angular app created with Angular CLI in WebStorm (at repo root).
2. `firebase init`: no default project; selected Firestore, Functions (TypeScript), Emulators.
   - Emulators selected: **Authentication, Functions, Firestore** (+ Emulator UI).
   - Skipped: App Hosting (SSR), Database (Realtime DB), Hosting (not needed locally), Pub/Sub.
3. Agent-skills prompt in `firebase init` accidentally answered "no" (typo) → installed afterwards:
   ```bash
   claude plugin marketplace add firebase/agent-skills
   claude plugin install firebase@firebase
   ```
4. `.firebaserc` default project → `demo-ping-me-maybe`.
5. Scaffolding prompt prepared for Claude Code (WebStorm) — creates `process/` docs, `src/app/{core,shared,features/alerts,features/admin}`, lazy routes, `CLAUDE.md`, `.gitignore` check; explicitly forbids new deps, logic, and config changes; requires a file list + `ng build`.
6. GitHub repo: `gh repo create mj-homework/ping-me-maybe --private --source=. --remote=origin --push`.
7. Follow-up prompt prepared to add precise ADR timestamps (values given explicitly, not generated).

---

## 6. Planned repo structure

```
ping-me-maybe/
├── src/app/
│   ├── core/ (guards, services, models)
│   ├── shared/
│   └── features/ (alerts, admin)
├── functions/          ← Cloud Functions (TypeScript)
├── process/
│   ├── plan.md
│   ├── prompts.md
│   ├── decisions.md
│   ├── assumptions.md
│   ├── ai-review-log.md
│   └── planning-chat-summary.md   ← this file
├── firebase.json, .firebaserc, firestore.rules
├── CLAUDE.md
└── README.md
```

---

## 7. Process practices agreed

- Log **every prompt** verbatim in `process/prompts.md`.
- After every AI output: check it, record what was accepted/changed/rejected in `ai-review-log.md`.
- Constrain AI prompts explicitly (scope, no new deps, "don't assume versions", "list every file", "never guess timestamps").
- Commit per milestone with meaningful messages; push often so GitHub timestamps show the real timeline.

---

## 8. Open items / next steps

- [ ] Run the scaffolding prompt in Claude Code, review output, commit `chore: scaffold process docs, app structure and Firebase config`
- [ ] Run the timestamp-update prompt
- [ ] Phase 1: fill `assumptions.md` (what is "important", data sources, admin scope, latency, dedup, quiet hours)
- [ ] Decide concrete event sources (candidate: USGS earthquake GeoJSON feed — free, no key; plus mock/replay sources for news & markets)
- [ ] Define Firestore data model
- [ ] Clarify with Sonrisa: public repo vs. private with reviewers as collaborators

---

## Appendix: user prompts in this chat (verbatim)

| Time | Prompt |
|---|---|
| 13:15 | *(attached task-04-feature-design-and-build.docx)* "i just received my homework / do nothing / before i would like to talk about a details / show me your pre-roadmap" |
| 13:24 | "thinking about the app name... Alert shop, Alertbook, Alerter / do you have any funny idea?" |
| 13:27 | "Ping Me Maybe / iam starting to make the angular repo with webstorm / should i use the Angular CLI? / should i use monorepo? enduser app , admin app?" |
| 13:30 | "for backend i would like to use firebase" |
| 13:39 | *(screenshot of project tree)* "give me a prompt i can give to the webstorm integrated Claude Code to make the folders and files / now i have" |
| 13:41 | "before firebase init should i make the firebase project in firebase console?" |
| 13:57 | *(screenshot of emulator selection)* |
| 14:02 | "i typed a wrong "c" … how can i install agents?" |
| 14:04 | "now i need again the prompt i can give to IDE Claude" |
| 14:25 | "i would like to share the local repo on github / but not under my default user, instead under my mj-homework organization" |
| 14:30 | "the adr entries should have a more accurate timestamp: YYYY-MM-DD HH:mm" |
| 14:35 | "summerize this chat into md file" |
