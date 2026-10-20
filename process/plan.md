# Plan

> Filled 2026-10-19 18:15 (prompt #10) from `scope.md` and `chat-summaries/sonrisa-HW-0-work-schedule.md`.
> **Deadline:** 2026-10-20 13:00 (Europe/Budapest).

## Status

- [x] Phase 1–2: `assumptions.md`, `scope.md`, ADR-001…012
- [x] Config fixes (`.firebaserc`, deny-all `firestore.rules`), feeds verified with curl, fixtures captured
- [x] Phase 3: `design.md` (accepted 17:26), ADR-013, ADR-014
- [x] Restructure: Angular app moved to `app/`, next to `functions/` (ADR-015, prompt #14)
- [ ] **M3 – Ingestion**
  - [x] Part 1: `parseFeed` (RSS + Atom), `ReplaySourceAdapter`, source config, `eventId`; 13 Vitest tests on all four fixtures (prompt #11)
  - [x] Part 2a: `pollAllSources` with `create()` dedup + `sources` status, `onCall pollSourcesNow` (replay only), `npm run poll:replay` dev script (prompt #17); tried against the emulator by me; unit tests with a fake Firestore (prompt #18)
  - [ ] Part 2b: live `FeedSourceAdapter` (User-Agent, timeout), `onSchedule`
- [ ] M1 + M2 – auth, rule CRUD, security rules + rules tests
  - [x] Emulator login (email/password), sign-out – code in prompt #19; tried in the browser by me, works (~23:30)
  - [x] Rule form on `/alerts` (create, list, pause/resume, delete) + `rules` security rules + index – code in prompt #21, hardened in #22; tried in the browser by me, works (~00:50)
  - [x] Rules tests for `rules` and `events` (prompt #24)
- [x] M5 part: `/admin/events` list, `admin` guard, `events` admin-read rule – code in prompts #19/#20; tried in the browser by me, works (~23:30)
- [x] M4 – matcher, email (Mailpit), idempotency (S4) – code in #23 (matcher + `matchEvent` + `sendDelivery` + email channel, matcher tests); tried by me, works (~01:27)
- [ ] M5 + M6 – admin view, Fetch now, guard
- [ ] S1 – Slack (only if M4 passes)
- [ ] README, demo rehearsal, close logs, final push

**Behind schedule:** design work ran until ~18:15 instead of 17:15, so M3 has ~45 min before the 19:00 break.

## Tonight (replaces this evening's time blocks)

Decided by me: "Tonight a thin, visible slice in 4 steps – see todo-for-night.md."

1. Replay poll → `events` in the Firestore emulator (prompt #17)
2. Login + admin event list on `/admin/events` (prompt #19)
3. Create a rule (minimal rules)

Decided by me: "Users cannot read events (design.md §1), so step 2 shows them on an admin page, and login moves forward from step 3."
4. Match → email in Mailpit

If step 4 does not fit, it goes first in the morning; security-rules tests move to the morning.

## Time blocks

| When | What |
|---|---|
| evening | See **Tonight** above |
| night | Sleep |
| 08:15 – 09:00 | Rules tests |
| 09:00 – 09:30 | Admin claim seed script (A16) |
| 09:30 – 10:45 | **M5** admin view (rules, deliveries) + **M6** Fetch now button |
| 10:45 – 11:30 | **S1 – Slack**, if it fits |
| 11:30 – 13:00 | README, demo rehearsal, logs, final push |

Decided by me: "Morning order: rules tests first (never cut), live adapter after Slack."

Ingestion goes first because it has the most uncertainty (live feeds, formats, dedup) and is testable without UI.

## Cut lines (`scope.md` §5)

1. Could items (C1–C6) → 2. S3, then S2 → 3. S1 Slack → 4. live Reddit adapter (replay only).
Live `FeedSourceAdapter` + `onSchedule` (M3 part 2b) go after S1 – replay is enough for the demo.
**Never cut:** idempotency (S4), security rules, `ai-review-log.md`, README.
If M4 is not done by midnight: it goes first in the morning and the admin view shrinks.

## Risks

- Schedule slip (already ~1 h behind).
- Unverified Firebase APIs (`design.md` §5) – check with the Firebase skills before coding.
- `firestore-rules-author` subagent could not start in Claude Code (prompt #6) – rules may have to be authored directly and audited.
- Live feeds change or Reddit blocks – replay adapter as fallback (ADR-010).
- Demo step 6 unsolved (replay data is deduplicated).

## Where I am

- M3 part 1 committed and pushed. Next: M3 part 2 (live adapter + poll). Firebase APIs from `design.md` §5 to verify first.

## Break rule

Before every break: commit + push, and 2–3 lines here – where I am, what's next.
