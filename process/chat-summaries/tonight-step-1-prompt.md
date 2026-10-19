# Tonight – step 1 prompt (IDE Claude)

> ⚠️ Before sending:
> 1. Change the time at the start (22:20) to when you actually send it.
> 2. Both "Decided by me" quotes are the planning chat's wording – edit if you'd say it differently.
> 3. #16 time (22:15) is an estimate – fix it if you know the real time.

```
22:20 Tonight's step 1 (process/todo-for-night.md): replay poll writes events into the Firestore emulator. Read CLAUDE.md, process/design.md and functions/src/sources/ first. Follow design.md; if you deviate, say where and why. Commit only after my OK. Do not push.

1. functions/src/poll/poll-all-sources.ts – pollAllSources(db, adapters):
   - for each adapter: fetchEvents, then write each event to `events/{eventId}` with create() (ADR-009/013), adding ingestedAt (server timestamp).
   - an existing doc (ALREADY_EXISTS) counts as "skipped", not an error. Verify the error code with the Firebase skills – design.md §5 lists it as unverified.
   - update `sources/{sourceId}`: lastPolledAt, lastError (null on success, readable message on failure). One failing source must not stop the others.
   - return a summary per source: created, skipped, error.

2. pollSourcesNow as onCall with the admin check from ADR-013 (request.auth?.token.admin === true), using pollAllSources with the adapter chosen by SOURCE_MODE (only "replay" exists now). Export it from index.ts. Verify the firebase-functions v7 import paths with the Firebase skills (design.md §5).

3. A dev script so I can run the poll against the emulator without login: `npm run poll:replay` in functions/, which builds, connects to the Firestore emulator (FIRESTORE_EMULATOR_HOST), runs pollAllSources with the replay adapters and prints the summary. It must refuse to run if FIRESTORE_EMULATOR_HOST is not set (emulator-only rule).

4. Not now: live adapter, onSchedule, the admin UI button, rules for events.

5. Run lint, build and the existing tests. Then tell me exactly how to try it:
   - which commands, in which terminal, in what order,
   - what I should see in the Emulator UI (Firestore tab) after the first run,
   - what the second run should print (everything skipped – dedup).

6. Explain the new code in 5–10 lines, in plain words: what runs where, and how data flows.

7. Process:
   - plan.md: tonight's order replaces the time blocks for this evening. Decided by me: "Tonight a thin, visible slice in 4 steps – see todo-for-night.md." Log as an ADR only if you think it changes scope; tell me which.
   - Log this prompt as #17.
   - Also log the previous prompt as #16 (time 22:15; process fixes for #13–#15 and the CRLF entry time; committed in 0400614; verdict accepted – confirmed by me).
   - #14 Outcome: add "app.spec.ts fixed in the same commit (router-outlet instead of h1); ng test 2/2."

Show me the file list and the test/lint output, then stop.
```

## Context for the new planning chat

Paste this as the first message of the new chat, together with the repo link (https://github.com/mj-homework/ping-me-maybe):

- Homework "Ping Me Maybe" (Sonrisa interview), deadline 2026-10-20 13:00. Process is graded as much as code.
- State at 22:20: `main` at 0400614. Parser + replay adapter done (13 tests). Angular app moved to `app/` (ADR-015), one Prettier style for the repo (ADR-016), LF via `.gitattributes`. Emulators run (JDK 21 installed).
- Tonight's plan: `process/todo-for-night.md` – 4 visible steps. Step 1 prompt above is ready, not yet sent.
- Working rules: IDE Claude never pushes, commits only after my OK, never writes verdicts. Call out any placeholder or wording of mine in a prompt *above* the prompt, not below.
