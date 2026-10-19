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
  - [ ] Part 2: live `FeedSourceAdapter` (User-Agent, timeout), `pollAllSources` with `create()` dedup + `sources` status, `onSchedule` + `onCall pollSourcesNow` ← next
- [ ] M1 + M2 – auth, rule CRUD, security rules + rules tests
- [ ] M4 – matcher, email (Mailpit), idempotency (S4)
- [ ] M5 + M6 – admin view, Fetch now, guard
- [ ] S1 – Slack (only if M4 passes)
- [ ] README, demo rehearsal, close logs, final push

**Behind schedule:** design work ran until ~18:15 instead of 17:15, so M3 has ~45 min before the 19:00 break.

## Time blocks

| When | What |
|---|---|
| 17:15 – 19:00 | **M3:** replay adapter + fixture tests, live RSS adapter, `pollSourcesNow`. Commit + push before 19:00 |
| 19:00 – 20:30 | Family – hard stop |
| 20:30 – 22:30 | **M1 + M2:** auth, rule CRUD, security rules + rules tests |
| 22:30 – 00:30 | **M4:** matcher + email + idempotency |
| night | Sleep |
| morning – 10:30 | **M5 + M6:** admin view, Fetch now, guard |
| 10:30 – 11:30 | **S1 – Slack**, if it fits |
| 11:30 – 13:00 | README, demo rehearsal, logs, final push |

Ingestion goes first because it has the most uncertainty (live feeds, formats, dedup) and is testable without UI.

## Cut lines (`scope.md` §5)

1. Could items (C1–C6) → 2. S3, then S2 → 3. S1 Slack → 4. live Reddit adapter (replay only).
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
