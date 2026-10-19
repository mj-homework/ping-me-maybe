# TODO for tonight – 2026-10-19

Goal: one thin, visible end-to-end slice. After every step I look at something before moving on.

## 1. "Fetch now" → events in Firestore (~45 min)

- `pollSourcesNow` in **replay mode** writes the fixture events into Firestore (`create()` dedup).
- **I see:** documents in the `events` collection in the Emulator UI.

## 2. Event list on `/alerts` (~45 min)

- Angular reads the `events` collection and lists them.
- **I see:** BBC and Reddit headlines in the browser.

## 3. Simple login + create a rule (~1 h)

- Emulator login, a form: source(s) + keywords.
- Minimal security rules: users read/write only their own rules.
- **I see:** my own rule in the list.

## 4. Match → email in Mailpit (~1 h)

- Matcher (any keyword, ADR-014) + email channel.
- **I see:** the email for the `florida` rule in Mailpit.

If step 4 does not fit tonight, it goes first tomorrow morning. Security-rules tests also move to the morning.

## How I work tonight

- One prompt per step, not one big "do M3".
- End every prompt with: *"Explain the new code in 5–10 lines, in plain words: what runs where, and how data flows."*
- I start the emulator and press the buttons myself.
- Process log: one short line per step; a full review entry only if a check really finds something.
- Before every break: commit + push, and 2–3 lines in `plan.md`.
