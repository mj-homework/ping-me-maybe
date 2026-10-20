# Ping Me Maybe

Users set up alert rules (sources + keywords) and get an email when a matching world event (news, markets, odd news) comes in; admins see the ingested events.

## How this was built

Development used two Claudes:

- **Claude Code in the IDE** wrote the code and the process logs.
- **A separate planning chat** (Claude desktop app, Windows) planned the steps, wrote the prompts and checked the IDE Claude's reports.
- **I** decided, checked in the browser, committed, pushed and merged.

That is why the logs in `process/` label each check as "Check (planning chat)", "Check (IDE Claude, …)" or "Check (me)". Every prompt with its outcome is in [`process/prompts.md`](process/prompts.md), every review of AI output in [`process/ai-review-log.md`](process/ai-review-log.md), and the hand-offs between planning chats in [`process/chat-summaries/`](process/chat-summaries/).

## How to try it locally

Everything runs on the Firebase Emulator Suite with the demo project `demo-ping-me-maybe`. There is no real Firebase project, no billing and nothing to configure.

**Runs fully offline.**

- **Feeds:** the news feeds are snapshots in the repo, in `functions/fixtures/`. `bbc-world.xml` and `bbc-business.xml` were recorded from the live BBC feeds on 2026-10-19 (~17:00 Europe/Budapest); `reddit-nottheonion.demo.xml` is a small hand-curated replay of the r/nottheonion feed for a predictable demo. Polling reads these files; no feed is fetched.
- **No outside calls from the project's code:** after `npm install`, the app and the Cloud Functions talk only to the local emulators and Mailpit. The only network client in `functions/` is the SMTP connection to `SMTP_HOST`, which defaults to `127.0.0.1`.
- **Emails** go only to the local Mailpit (SMTP 127.0.0.1:1025); nothing is sent to a real mailbox.
- **Firebase:** a `demo-` project ID can only be used with the emulators, so nothing can reach a real Firebase project.
- **Exceptions outside the project's code:** on its first `firebase emulators:start`, the Firebase CLI downloads the emulator files once (then cached in `~/.cache/firebase/emulators`), and it may check for a newer CLI version. Event links in the app and in the emails open the real news sites only when you click them.

### 1. Prerequisites

- **Node.js 24** (`engines` in `functions/package.json`) and **npm** (npm 12 is used here).
- **Firebase CLI** (`npm install -g firebase-tools`); major version 15 is used here.
- **JDK 21 or newer**, for the Firestore emulator (the Firebase CLI's minimum is Java 21).
- **Mailpit**, to catch the emails: download the release zip for your OS from [Mailpit's GitHub releases page](https://github.com/axllent/mailpit/releases) and unzip it into any folder; no install needed.
  Docker also works: `docker run -p 1025:1025 -p 8025:8025 axllent/mailpit`.

### 2. Install once

```powershell
cd functions; npm install; cd ..
cd app; npm install; cd ..
```

npm 12 blocks install scripts; `app/package.json` (`allowScripts`) already allows the one that is needed.

### 3. Start, in order, one terminal each

1. **Mailpit**, from its folder.

   Windows (PowerShell):

   ```powershell
   .\mailpit.exe --smtp 127.0.0.1:1025 --listen 127.0.0.1:8025
   ```

   macOS / Linux:

   ```bash
   ./mailpit --smtp 127.0.0.1:1025 --listen 127.0.0.1:8025
   ```

   SMTP on 1025 and the UI on 8025, bound to this machine only; this matches the functions' `SMTP_HOST` / `SMTP_PORT` defaults, so there is no config.

2. **Build the functions**, in `functions/`: `npm run build`
3. **Emulators**, in the repo root: `firebase emulators:start`
4. **App**, in `app/`: `npm start`, then open http://localhost:4200

### 4. Create users

Admin (emulator-only demo data; the script refuses to run without the env var), in `functions/`:

Windows (PowerShell):

```powershell
$env:FIREBASE_AUTH_EMULATOR_HOST='127.0.0.1:9099'; npm run admin:grant -- admin@example.com admin123
```

macOS / Linux:

```bash
FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 npm run admin:grant -- admin@example.com admin123
```

The script creates the user if it does not exist yet and gives it the `admin` custom claim. If that user was already signed in, sign out and in again.

A normal user: enter an email and password in the app and click **Create account**.

### 5. Demo flow

1. Sign in (admin or normal user).
2. On `/alerts`, create a rule **before** polling, e.g. source _Reddit_, keyword `florida`, channel email. Rules only match events ingested after the rule was created (A5).
3. Poll the recorded feeds once. As admin, open `/admin/events` and click **Fetch now**: a small table shows created / skipped / error per source, and the events list fills by itself.

   Alternative without the browser or an admin account, in `functions/`:

   Windows (PowerShell):

   ```powershell
   $env:FIRESTORE_EMULATOR_HOST='127.0.0.1:8080'; npm run poll:replay
   ```

   macOS / Linux:

   ```bash
   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 npm run poll:replay
   ```

4. Open Mailpit at http://localhost:8025: 2 emails for the `florida` rule.
5. As admin, open `/admin` (the **Admin** link in the header); the tabs **Events / Rules / Deliveries** switch between the admin pages (hover a tab for a short description):
   - `/admin/events`: the ingested events.
   - `/admin/rules`: all users' rules, with a disabled **Disable** button (coming later).
   - `/admin/deliveries`: every notification with its status (`sent` / `failed`) and error.
6. Optional – **failed delivery:** stop Mailpit, create another rule (e.g. _BBC World_, keyword `the`, email), delete the `events` collection in the Emulator UI (Firestore), and click **Fetch now** (or run `poll:replay`) again. `/admin/deliveries` shows `failed` rows for the new rule with the SMTP connection error and a disabled **Retry** button. The old `sent` rows do not change and the first rule gets no new rows: each delivery has a fixed ID per event, rule and channel, so it is never created twice.

Polling again (**Fetch now** or `poll:replay`) adds nothing: the events already exist (deduplicated by ID), so no new emails are sent. If you delete `deliveries` too before polling again, the emails are sent again; in real use `deliveries` is never deleted, which is what prevents duplicates (S4).

Rules can be edited on `/alerts` (**Edit**: name, sources, keywords). An edit applies to events ingested afterwards; past deliveries stay as they are.

What is not built yet: see [Not built](#not-built).

### Ports and URLs

| What                 | Where                 |
| -------------------- | --------------------- |
| App UI               | http://localhost:4200 |
| Firebase Emulator UI | http://localhost:4000 |
| Firestore            | 127.0.0.1:8080        |
| Auth                 | 127.0.0.1:9099        |
| Functions            | 127.0.0.1:5001        |
| Mailpit UI           | http://localhost:8025 |
| Mailpit SMTP         | 127.0.0.1:1025        |

Rows with `http://` open in a browser; the others are ports the code uses.

### After a restart or rebuild

- Emulator data is empty on every start: run `admin:grant` again and re-create your rules.
- After changing `functions/src`, run `npm run build` in `functions/`. The emulator reloads `lib/` by itself; it does not compile TypeScript.
- The app reloads by itself.

### Tests

- `functions/`: `npm test` (unit tests, no emulator).
- `functions/`: `npm run test:rules` (security rules). It starts its own Firestore emulator, so stop `firebase emulators:start` first (port 8080).
- `app/`: `ng test` (or `npm test` without a global Angular CLI).

### Troubleshooting

- **Port already in use:** another emulator or app is still running; stop it, or check the ports table.
- **No email:** is Mailpit running? In the Emulator UI → Firestore, open the `deliveries` document and check `status` and `error`.
- **No email and no delivery:** were the events already there before the rule? Rules only match newer events (A5) and a re-poll creates no new events (dedup). Delete the `events` collection in the Emulator UI and click **Fetch now** (or run `poll:replay`) again.
- **Admin page not visible:** sign out and in again, so the ID token carries the new claim.

## Not built

- **Slack channel:** designed (ADR-011), not built. A rule can only use email.
- **Live feed adapter and schedule** (M3 part 2b): only the replay sources (recorded feeds in `functions/fixtures/`), polled with **Fetch now** or `poll:replay`.
- **Admin write actions** (C2–C4): **Disable** (rules) and **Retry** (deliveries) are shown, but disabled.

## Known limitations

- Keyword matching is substring-based: `rain` also matches "Ukraine" (#23).
- `ng build` shows a bundle budget warning (initial ~848 kB > 500 kB); it is a warning only.
- Wide tables scroll the page on small screens.
- Tooltips are the browser's native `title`.

## Development

In `app/`:

- `ng build` (or `npm run build`): production build into `app/dist/`.
- `ng test` (or `npm test`): unit tests with Vitest.
