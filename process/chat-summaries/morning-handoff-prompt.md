# Ping Me Maybe – handoff to the next planning chat (morning)

Paste this as the first message of the new chat, together with the repo link: https://github.com/mj-homework/ping-me-maybe

**Language:** talk to me in Hungarian. Prompts for the IDE Claude stay in English.

## Context

- Homework "Ping Me Maybe" (Sonrisa interview), **deadline 2026-10-20 13:00**. Process is graded as much as code.
- State at 08:31: `main` at `2c5fb6c` (#24 merged, fast-forward). Branches `feature/tonight-step-3`, `-4` and `feature/rules-tests` are all merged.
- Plan and time blocks: `process/plan.md`; night plan: `process/todo-for-night.md`.

## Done since the last handoff

| Prompt | What | Commit |
|---|---|---|
| #21 | Rule form on `/alerts` (create, list, pause/resume, delete), `rules` security rules, composite index | ab4b74e |
| #22 | Rules hardening (`trim()`, `toSet()` no duplicates), spacers → CSS, `normalizeKeywords` test | 5f260da |
| #23 | `matchRules` (pure), `matchEvent` + `sendDelivery` triggers, email channel (nodemailer 10.0.15 pinned) → Mailpit | 7071941 |
| #24 | Rules tests with `@firebase/rules-unit-testing` 6.0.0 + `firebase` 13.0.0 (dev, `functions/`), 34/34; mutation check | 2c5fb6c |

- Checked by me: #21 in the browser incl. second user cannot see the first user's rule (~00:50); #23 end to end – `florida` rule → 2 emails in Mailpit, 2 `sent` deliveries, second `poll:replay` sends nothing (~01:27).
- `florida` matches **2** demo entries (title + summary-only) – my "exactly one" in the prompt was wrong; the test follows the fixture.
- #24: version exception (6.0.0 is 13 days old, the two-week rule missed by one day) – IDE Claude asked, I chose it; reason sent to IDE Claude at ~08:24/08:28 to put in the #24 entry and the 08:15 review-log "Why".

## Open process items – fold into the next real prompt (#25)

- #24: verdict "accepted – confirmed by me", commit hash `2c5fb6c`; tick the rules-tests line in `plan.md`.
- Check that the #24 entry and the 08:15 review-log entry contain the version-exception reason (not "Reason not stated").

## Next (plan.md time blocks)

1. **09:00–09:30 – admin claim seed script (A16):** sets `admin: true` on a user in the Auth emulator, so reviewers skip the Emulator UI clicks.
2. **09:30–10:45 – M5 admin view (rules, deliveries with status/error) + M6 Fetch now button** (`pollSourcesNow`, admin only). Needs `deliveries` read rules (admin all, user own) + tests. Disabled admin write buttons (A15).
3. **10:45–11:30 – S1 Slack, if it fits:** pure `NotificationChannel` adapter + registry entry; the Slack commit must not touch matcher/dispatcher code (ADR-011). Webhook URL via params, never hardcoded.
4. **11:30–13:00 – README, demo rehearsal, close logs, final push.**
   - Beef up README.md; state near the top that development used two Claudes: Claude Code in the IDE wrote the code, a separate planning chat (Claude desktop app, Windows) planned, wrote prompts and checked the IDE Claude's work (explains the "Check (planning chat)" / "Check (IDE Claude, …)" labels).
- Cut line: live `FeedSourceAdapter` + `onSchedule` (M3 part 2b) after S1 – replay is enough for the demo.
- Open from design.md §5: demo step 6 (failed delivery) needs a second replay fixture or a replay reset – or simply stop Mailpit before the first poll.

## How to run it

1. Mailpit (SMTP 1025, UI http://localhost:8025)
2. `functions/`: `npm run build` (the emulator does not compile TS; it reloads `lib/` itself)
3. Repo root: `firebase emulators:start` (fresh start = empty data; A5: rule must exist before the events)
4. `app/`: `npm start` → http://localhost:4200, create account, create rule on `/alerts`
5. `functions/`: `$env:FIRESTORE_EMULATOR_HOST='127.0.0.1:8080'; npm run poll:replay`
6. Admin today: Emulator UI (http://127.0.0.1:4000) → Authentication → custom claims `{"admin": true}` → sign out/in
- Tests: `functions/`: `npm test` (unit, 25), `npm run test:rules` (rules, 34, starts its own Firestore emulator); `app/`: `ng test` (6)

## Known notes

- Substring matching: `rain` matches "Ukraine" (known limitation, logged in #23).
- `channelRegistry` is `Partial<Record<…>>` until Slack exists (deviation from design.md §2, logged).
- Rule form reads the source list from a constant, not the `sources` collection (deviation, logged in #21).
- `ng build` budget warning (~825 kB > 500 kB), warning only. No ESLint in `app/`, only Prettier.
- `firestore-rules-author` subagent cannot start; rules are written following `firestore-rules-creation`.
- Supply chain rule: newest release at least two weeks old; exceptions are decided by me and logged.

## Working rules

- IDE Claude never pushes, commits only after my OK, never writes verdicts. I push and merge (`git merge --ff-only`).
- One branch per step, one prompt per step.
- **Every prompt starts with a strong guess of the send time** (a few minutes after now); I correct it if needed.
- End every prompt with: "Explain the new code in 5–10 lines, in plain words: what runs where, and how data flows."
- Call out any placeholder, decision or wording of mine *above* the prompt, not below.
- Process-only fixes are not logged as separate prompts; they are folded into the next entry.
- Attribute checks: "Check (planning chat)", "Check (IDE Claude, …)", "Check (me)". Every review-log entry needs a real "Why".
