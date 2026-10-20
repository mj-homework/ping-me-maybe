# Ping Me Maybe

Users set up alert rules (sources + keywords) and get an email when a matching world event (news, markets, odd news) comes in; admins see the ingested events.

## How to try it locally

Everything runs on the Firebase Emulator Suite with the demo project `demo-ping-me-maybe`. There is no real Firebase project, no billing and nothing to configure.

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
3. Poll the recorded feeds once, in `functions/`:

   Windows (PowerShell):

   ```powershell
   $env:FIRESTORE_EMULATOR_HOST='127.0.0.1:8080'; npm run poll:replay
   ```

   macOS / Linux:

   ```bash
   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 npm run poll:replay
   ```

4. Open Mailpit at http://127.0.0.1:8025: 2 emails for the `florida` rule.
5. As admin, open `/admin/events` to see the ingested events.

Running `poll:replay` again adds nothing: the events already exist (deduplicated by ID), so no new emails are sent.

Not in the demo yet: Slack, the admin "Fetch now" button, the admin deliveries view.

### Ports and URLs

| What         | Where                 |
| ------------ | --------------------- |
| App          | http://localhost:4200 |
| Emulator UI  | http://localhost:4000 |
| Firestore    | 127.0.0.1:8080        |
| Auth         | 127.0.0.1:9099        |
| Functions    | 127.0.0.1:5001        |
| Mailpit UI   | http://127.0.0.1:8025 |
| Mailpit SMTP | 127.0.0.1:1025        |

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
- **Admin page not visible:** sign out and in again, so the ID token carries the new claim.

## Development

In `app/`:

- `ng build` (or `npm run build`): production build into `app/dist/`.
- `ng test` (or `npm test`): unit tests with Vitest.
