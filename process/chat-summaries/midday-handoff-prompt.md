# Ping Me Maybe – handoff to the next planning chat (midday)

Paste this as the first message of the new chat, together with the repo link: https://github.com/mj-homework/ping-me-maybe

**Language:** talk to me in Hungarian. Prompts for the IDE Claude stay in English.

## Context

- Homework "Ping Me Maybe" (Sonrisa interview), **deadline 2026-10-20 13:00**. Process is graded as much as code.
- State at 11:30: `main` at `be9b119`. `feature/fetch-now` (`794198b`, #31) is pushed and reviewed by the planning chat (OK) but **not merged yet** – merge with `git merge --ff-only` before #32.
- Plan and time blocks: `process/plan.md`. Logs: `process/prompts.md`, `process/ai-review-log.md`.

## Done since the morning handoff

| Prompt | What | Commit |
|---|---|---|
| #25 | `npm run admin:grant -- <email> [password]` (creates the user if missing, sets `admin: true`; emulator-only), shared `defaultProjectId()` | 6847904 |
| #26 | README "How to try it locally" quick start (prereqs, install, start order, users, demo flow, ports, tests, troubleshooting) | aecf4bd |
| #27 / #28 | README fixes (Mailpit flags, OS labels, ports table labels, Mailpit UI `localhost:8025`), process fixes | a60bd2a / beed520 |
| #29 | M5: `/admin/rules`, `/admin/deliveries`, `deliveries` read rule (owner or admin) + rules tests (42/42), disabled Disable/Retry (A15) | c446273 |
| #30 | Docs: admin pages in demo flow, failed-delivery step, "no email" troubleshooting, design.md §5 resolved; #10/#11 old log gaps fixed | 31bece6 (+ be9b119 by me) |
| #31 | M6: "Fetch now" button on `/admin/events` → `pollSourcesNow` callable, per-source result table, `sourceName()` helper | 794198b |

- Verdicts #25–#30 "accepted – confirmed by me" are in. **#31: verdict not yet set** (planning chat reviewed OK; I checked it in the browser ~11:07).
- `plan.md`: M5 + M6 ticked (in #31). Open child line under M1+M2: "Rule editing on `/alerts` … – before S1".

## Next

1. **#32 – rule editing (M2 "edit")**, ~11:31–11:50. The prompt is ready below; send it after merging `feature/fetch-now`. It also folds: #31 hash + verdict, `/admin/events` list with source names, new time blocks, **S1 Slack marked cut** in `plan.md`.
2. **#33 – own CSS** (~11:50–12:05): a small hand-written `styles.css` (no dependency; PrimeNG/Pico rejected: time, supply-chain rule, bundle). Tables, forms, buttons, header nav readable; no component rewrites.
3. **12:05–13:00 – close out:**
   - README: state near the top that development used two Claudes: Claude Code in the IDE wrote the code; a separate planning chat (Claude desktop app, Windows) planned, wrote prompts and checked the IDE Claude's work (explains the "Check (planning chat)" / "Check (IDE Claude, …)" labels). Add "Not built: Slack (designed, ADR-011), live feed adapter + schedule (M3 part 2b), admin write actions (C2–C4)". Known limitations (substring match `rain` → "Ukraine", bundle budget warning).
   - Demo rehearsal from a fresh emulator following the README.
   - Close all logs (no `[FILL IN]`, `time not given`, `Reason not stated`, `[PENDING`), tick `plan.md`, final push and merge. **No new features after 12:15.**

### #32 prompt (ready, not sent yet)

```
11:31

Morning step 6 on a new branch `feature/rule-edit` from `main` (794198b): M2 – edit an existing rule on `/alerts` (the missing "edit" from the M2 story, deferred in #21).

Decided by me: "Edit name, sources and keywords; channels stay as they are (only email exists). An edit affects only events ingested afterwards; existing deliveries are not touched. `createdAt` does not change, so A5 stays as it is."

1. App:
   - `RulesService.update(id, { name, sourceIds, keywords })`: same normalization as `create` (`normalizeKeywords`), `updatedAt: serverTimestamp()`, never sends `userId` or `createdAt` changes. Use `updateDoc` so the other fields stay.
   - `/alerts`: an "Edit" button per own rule. Reuse the existing form if that is simplest (fill it, button text "Save changes", plus "Cancel"); otherwise a small inline form. Same validation as create (name, ≥1 source, ≥1 keyword). Show the Firestore error text on failure. One rule in edit at a time.
   - `/admin/events` list: show source display names with `sourceName()` instead of IDs (the Fetch now table already does).
2. Rules: no `firestore.rules` change expected (owner update with `isValidRule`, `updatedAt == request.time`, immutable `userId` / `createdAt`). Check the rules tests: if no test covers an owner changing name / sourceIds / keywords with a server `updatedAt`, add one (allowed), plus one that changes `createdAt` (denied) if missing. No mutation check this time.
3. Tests: Vitest for `update` only if it fits without a real Firestore (as with `watchAll` in #29, say if not); keep `normalizeKeywords` tests green.
4. README: one line in the demo flow or under it: rules can be edited on `/alerts`; an edit applies to events ingested afterwards.
5. Process:
   - `prompts.md` #31: "Committed in 794198b after my OK."; verdict "accepted – confirmed by me".
   - `plan.md`: leave the rule-editing line unticked until my check.
   - `plan.md` time blocks: from now on – 11:30–11:50 rule editing (#32), 11:50–12:05 own CSS, 12:05–13:00 README, demo rehearsal, close logs, final push. S1 Slack is cut: mark it in `plan.md` as "cut – designed (ADR-011), not built; time went to M2 editing and M6".
6. Checks: functions lint, build, `npm test`, `npm run test:rules` (ask before stopping emulators you did not start; do not delete users or data in my running emulators); `ng build`, `ng test`; Prettier on touched files. Give me the try-it steps.
7. Log as #32 in `prompts.md`.

Not now: styling, Slack, channel editing, admin write actions.

Commit only after my OK, do not push.

Explain the new code in 5–10 lines, in plain words: what runs where, and how data flows.
```

Before sending: the send time (first line) is a guess – correct it. "Decided by me" and the #31 verdict are written in my name – check them.

## How to run it (see README for details)

1. Mailpit from its folder: `.\mailpit.exe --smtp 127.0.0.1:1025 --listen 127.0.0.1:8025` (UI http://localhost:8025)
2. `functions/`: `npm run build`
3. Repo root: `firebase emulators:start` (fresh start = empty data)
4. `functions/`: `$env:FIREBASE_AUTH_EMULATOR_HOST='127.0.0.1:9099'; npm run admin:grant -- admin@example.com admin123`
5. `app/`: `npm start` → http://localhost:4200, sign in, create a rule on `/alerts` **before** polling
6. `/admin/events` → **Fetch now** (or `functions/`: `$env:FIRESTORE_EMULATOR_HOST='127.0.0.1:8080'; npm run poll:replay`)
- Tests: `functions/`: `npm test` (25), `npm run test:rules` (42, needs port 8080 free); `app/`: `ng test`

## Demo knowledge (learned today)

- **No email after a poll:** the events were already there before the rule (A5 + dedup). Delete `events` in the Emulator UI and poll again.
- **Failed-delivery demo:** stop Mailpit, create a **new** rule (e.g. BBC World, `the`), delete `events`, poll → `failed` rows with the SMTP error. The old rule gets nothing (its delivery IDs already exist).
- Deleting `events` **and** `deliveries` → all matching rules send again (I tested: admin + normal user `florida` → 4 emails).
- If a rule's owner is deleted from Auth, its deliveries fail with "There is no user record corresponding to the provided identifier." – readable reason, no crash (A13). Fix: `admin:grant` re-creates the user; re-create the rule.
- `localhost` for browser URLs, `127.0.0.1` for ports the code uses (README note under the ports table).

## Known notes

- Substring matching: `rain` matches "Ukraine" (known limitation, #23).
- `channelRegistry` is `Partial<Record<…>>` (no Slack) – deviation from design.md §2, logged.
- Rule form reads sources from a constant, `sources` collection stays closed (#21, #31).
- `ng build` budget warning (~830 kB > 500 kB), warning only. No ESLint in `app/`, only Prettier.
- `firestore-rules-author` subagent cannot start; rules are written following `firestore-rules-creation`.
- Supply-chain rule: newest release at least two weeks old; exceptions decided by me and logged (#23 nodemailer, #24 rules-unit-testing).
- IDE Claude cannot drive the browser reliably (#26) – browser checks are mine.

## Working rules

- IDE Claude never pushes, commits only after my OK, never writes verdicts on its own. I push and merge (`git merge --ff-only`).
- One branch per step, one prompt per step.
- **Every prompt starts with a strong guess of the send time** (a few minutes after now); I correct it.
- End every prompt with: "Explain the new code in 5–10 lines, in plain words: what runs where, and how data flows."
- Call out any placeholder, decision or wording of mine *above* the prompt, not below.
- **Don't draft the next prompt before the current step is reviewed** – there is almost always something to fix first.
- Process-only fixes are folded into the next real prompt, not logged separately.
- Attribute checks: "Check (planning chat)", "Check (IDE Claude, …)", "Check (me)". Every review-log entry needs a real "Why" and a time.
- Mutation checks: only on committed files (or back up first) – `git checkout` wiped uncommitted rules in #29.
- IDE Claude must not delete users or data in emulators it did not start.
