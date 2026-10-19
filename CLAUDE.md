# Ping Me Maybe

## Purpose

Users set up alerts to be notified about important world events (breaking news, market movements, natural disasters) via email and Slack. The design should make it easy to add more channels later. There is also an admin view.

This is a job-interview homework project. The **process** is graded as well as the code: planning, decisions and how AI output is reviewed. See `process/`.

## Stack

- **Frontend:** Angular 22 (standalone components, Vite-based `@angular/build`, Vitest), at the repo root
- **Backend:** Firebase Auth, Cloud Firestore, Cloud Functions for Firebase (TypeScript, Node 24, in `/functions`)
- **Local runtime:** Firebase Emulator Suite (Auth, Functions, Firestore, Emulator UI)
- **Firebase project ID:** `demo-ping-me-maybe` (emulator-only, no real project and no billing)

## Folder structure

```text
/                     Angular app (angular.json, package.json, src/)
src/app/
  core/guards/        route guards (e.g. admin role guard)
  core/services/      app-wide singleton services (auth, Firestore access)
  core/models/        shared TypeScript types / interfaces
  shared/             reusable presentational components, pipes, directives
  features/alerts/    user-facing alerts feature (/alerts)
  features/admin/     admin view (/admin, lazy-loaded)
functions/            Cloud Functions (TypeScript), source in functions/src
functions/fixtures/   recorded feed snapshots for parser tests and the replay adapter
firestore.rules       Firestore security rules
firestore.indexes.json
process/              process documentation (prompts, decisions, assumptions, AI review, plan)
```

## Conventions

- **Standalone components only**: no NgModules. Features are lazy-loaded with `loadComponent`.
- **Signals** for component state (`signal`, `computed`, `input()`, `output()`), not RxJS where a signal works.
- **Strict TypeScript.** Do not use `any`, and do not loosen compiler options.
- Follow the file naming already in the repo (`app.ts`, `alerts-page.ts`, so no `.component.ts` suffix) and the Prettier config (`.prettierrc`).
- **No new dependencies** (npm packages in either `package.json`) without asking first.
- **Emulator-only.** Never point code at a real Firebase project or deploy.
- **Never hardcode secrets or webhook URLs** (Slack webhooks, SMTP credentials, API keys). Use environment configuration or Functions params/secrets, and keep `.env*` files out of git.
- Use the installed Firebase agent skills for Firebase APIs. Firestore security rules go through the `firestore-rules-author` subagent.
- Authorization lives in security rules and Functions. Route guards are UX only.
- Triggers are at-least-once, so notification delivery must be idempotent (deterministic delivery IDs).
- All process log entries use timestamps in YYYY-MM-DD HH:mm, Europe/Budapest time. Never guess a timestamp – ask me if you don't know it.

## Process rules

- **Log every prompt in `process/prompts.md`**, in order, with the outcome and verdict (accepted / changed / rejected).
- Record significant decisions as ADRs in `process/decisions.md`.
- Record assumptions about the brief in `process/assumptions.md`.
- Record reviews of AI output in `process/ai-review-log.md`.

### Standing rule: Claude keeps the process logs

Follow this for every prompt without being asked:

- **Claude keeps the process logs, not the user.** After each prompt: log it in `prompts.md`; add `ai-review-log.md` entries when the user rejects or changes Claude's output or when a check finds a problem; record decisions as ADRs when they change scope or design; tick off / add points in `plan.md`.
- **The user's decisions come from their chat messages.** Quote them verbatim as "Decided by me: …". Never invent the user's reasons – if none was given, write "Reason not stated."
- **Timestamps:** use the time the user puts at the start of a prompt. If a prompt has none, write "time not given" and carry on – never block on it.
- **Review log voice:** attribute every check to whoever did it: "Check (planning chat): …", "Check (IDE Claude, script): …", "Check (me): …". Use `[FILL IN]` only where the check really has to be the user's.
- **Approvals:** when the user says "approved", record it next to the item (e.g. `design.md` §4) with the time.
- **Keep log entries short.** Process docs are updated in the same commit as the code they describe.

### Hard rules: git and scope

- **Never push – I push myself.** Commit only after I have seen `git status` + a diff summary and said OK.
- **One prompt = one commit.** Never bundle several prompts into one commit.
- **Never write a verdict** in prompts.md. Leave "[PENDING – my review]"; I set accepted / changed / rejected.
- **Never record something as done before it is done** (commits, pushes, approvals, test results).
- **Do only what the prompt asks.** If you think something extra is useful, propose it in your summary instead of implementing it.
