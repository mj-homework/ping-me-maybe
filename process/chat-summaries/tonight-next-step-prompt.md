# Ping Me Maybe – handoff to the next planning chat

Paste this as the first message of the new chat, together with the repo link: https://github.com/mj-homework/ping-me-maybe

**Language:** talk to me in Hungarian. Prompts for the IDE Claude stay in English.

## Context

- Homework "Ping Me Maybe" (Sonrisa interview), **deadline 2026-10-20 13:00**. Process is graded as much as code.
- State at 00:07: `main` at `43dd856`. Everything is pushed; `feature/tonight-step-2` is merged (fast-forward).
- Tonight's plan: `process/todo-for-night.md`.

## Done tonight

| Prompt | What | Commit |
|---|---|---|
| #17 | `pollAllSources` (`create()` dedup, `sources` status), `onCall pollSourcesNow` (replay), `npm run poll:replay` | 889695b |
| #18 | Unit tests for `pollAllSources` (fake Firestore, 4 cases; 17/17 functions tests) | 9175d59 |
| #19 | `firebase` SDK in `app/`, email/password emulator login, `/admin/events` (admin guard), `events` rule: admin read only | 32c2e8b |
| #20 | Admin events sorted by `publishedAt` | 03aeb83 |

- Step 2 was changed: users cannot read `events` (design.md §1), so the list is an admin page and login moved forward from step 3.
- Checked by me: 2× `poll:replay` (created, then all skipped); login + admin claim + `/admin/events` work in the browser (~23:30).

## Open process items – put them into the next real prompt (#21)

- Process-only commits to mention in the #21 entry: `bc5a6e9`, `b0c3b73`, `43dd856` (new rule: process-only fixes are not logged separately; they are folded into the next entry).
- Optional: in `plan.md`, replace "time not given" with ~23:30 on the two browser-check ticks.

## Next

1. **Tonight step 3 – rule form:** source(s) + keywords form, `rules` collection with security rules per design.md §1 (CRUD own, `createdAt == request.time`, `userId == auth.uid`, both immutable on update). I see: my own rule in the list.
2. **Tonight step 4 – match → email:** matcher (any keyword, ADR-014) + email channel to Mailpit. I see: the `florida` rule's email. If it does not fit tonight, it goes first in the morning.
3. **Morning:**
   - rules tests (`events`, `rules`), admin guard unit test,
   - admin claim seed script (A16), so reviewers do not need the Emulator UI clicks,
   - M3 part 2b: live `FeedSourceAdapter` + `onSchedule`,
   - M5 + M6: admin view, Fetch now button,
   - S1 Slack only if M4 passes,
   - 11:30–13:00: README, demo rehearsal, close logs, final push.

## How to run it (for reference)

1. Terminal 1 (repo root): `firebase emulators:start`
2. Terminal 2 (`functions/`): `npm run poll:replay` (needs `FIRESTORE_EMULATOR_HOST`)
3. Terminal 3 (`app/`): `npm start` → http://localhost:4200
4. Create an account in the header → Emulator UI (http://127.0.0.1:4000) → Authentication → Edit user → Custom claims `{"admin": true}` → sign out and in again.

## Known notes

- `ng build` budget warning: 812 kB > 500 kB (warning only). Lazy-loading Firebase was suggested, skipped for now.
- The app has no lint script (no ESLint), only Prettier.
- The `firestore-rules-author` subagent cannot start (tool-name mismatch); rules are written directly following `firestore-rules-creation`. The Firebase MCP server timed out once.
- npm 12: only `@firebase/util` has its install script allowed (`allowScripts` in `app/package.json`).

## Working rules

- IDE Claude never pushes, commits only after my OK, never writes verdicts. I push.
- Every prompt starts with the time; one prompt per step; end with "Explain the new code in 5–10 lines, in plain words: what runs where, and how data flows."
- Call out any placeholder or wording of mine in a prompt *above* the prompt, not below.
- Process-only fixes are not logged as separate prompts.
- Attribute checks: "Check (planning chat)", "Check (IDE Claude, …)", "Check (me)".
