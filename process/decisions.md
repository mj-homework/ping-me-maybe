# Architecture Decision Records

ADR-style log of significant technical decisions, the alternatives considered and their consequences.

> All timestamps are in Europe/Budapest time (format: `YYYY-MM-DD HH:mm`).

## Template

```markdown
## ADR-NNN: Title

- **Status:** proposed | accepted | superseded by ADR-XXX
- **Date:** YYYY-MM-DD HH:mm

### Context

### Decision

### Alternatives rejected

### Consequences
```

---

## ADR-001: Single Angular app with a lazy-loaded admin route

- **Status:** accepted
- **Date:** 2026-10-19 13:27

### Context

The brief asks for an "admin view", not a separate admin application. Users and admins share the same auth, data model and UI building blocks.

### Decision

One Angular application. The admin area is a lazy-loaded route (`/admin`), later protected by a role guard based on an admin custom claim.

### Alternatives rejected

- **Nx monorepo** – tooling and configuration overhead that is not justified for a single app plus functions.
- **Angular multi-project workspace** (separate admin app) – duplicated bootstrapping, auth and shared code for no user-facing benefit.

### Consequences

- Admin code is only downloaded by users who navigate to it.
- Client-side route guarding is UX only; real authorization must be enforced in Firestore security rules and Cloud Functions.

## ADR-002: Firebase (Auth, Firestore, Functions), emulator-first

- **Status:** accepted
- **Date:** 2026-10-19 13:30

### Context

The app needs authentication, a persistent store for users/alerts/events, scheduled polling of external sources and outbound notifications (email, Slack). It has to be easy for reviewers to run locally.

### Decision

Use Firebase Auth, Cloud Firestore and Cloud Functions (TypeScript), developed and demoed entirely against the Firebase Emulator Suite.

### Alternatives rejected

_(to be documented)_

### Consequences

- **Vendor lock-in** to Firebase/Google Cloud APIs.
- **Limited querying** in Firestore: matching events against alert rules is done in-function rather than with database queries.
- **At-least-once triggers**: Functions may fire more than once for the same event, so notification delivery needs idempotent delivery IDs to avoid duplicate messages.

## ADR-003: Angular stays at the repository root

- **Status:** accepted
- **Date:** 2026-10-19 13:39

### Context

The Angular CLI generated the app at the repo root, and `firebase init` added `functions/` next to it.

### Decision

Keep the Angular app at the root, with Cloud Functions in `/functions`.

### Alternatives rejected

- Moving the frontend into a subfolder (e.g. `/web`) – unnecessary churn in config files.

### Consequences

- Matches the standard Firebase project layout, so tooling and docs apply without adjustment.

## ADR-004: Project ID `demo-ping-me-maybe` (emulator-only)

- **Status:** accepted
- **Date:** 2026-10-19 13:41

### Context

Reviewers must be able to run the project without a Google Cloud account, billing or credentials.

### Decision

Use the project ID `demo-ping-me-maybe`. The `demo-` prefix makes the Firebase CLI treat it as an emulator-only project.

### Alternatives rejected

- A real Firebase project – requires credentials/billing from reviewers and risks touching real cloud resources.

### Consequences

- Reviewers need no billing or credentials, and the code cannot accidentally touch real cloud resources.
- A real project can be attached later via `firebase use --add`.

## ADR-005: Manual `pollSourcesNow` HTTP function alongside the scheduled poller

- **Status:** accepted
- **Date:** 2026-10-19 13:57

### Context

External sources are polled on a schedule. The Functions emulator does not run scheduled functions automatically.

### Decision

Besides the scheduled poller, add an HTTP function `pollSourcesNow`, triggered by an admin "Fetch now" button. Both share the same polling logic.

### Alternatives rejected

_(to be documented)_

### Consequences

- The polling pipeline can be exercised in the emulator.
- Demos are reproducible: the reviewer decides when a fetch happens.
- The HTTP endpoint must be restricted to admins.

## ADR-006: Official Firebase agent skills for Claude Code

- **Status:** accepted
- **Date:** 2026-10-19 14:02

### Context

AI assistants frequently produce outdated or hallucinated Firebase APIs (e.g. v1 vs v2 Functions, namespaced vs modular SDK).

### Decision

Install the official Firebase agent skills for Claude Code so generated code follows current Firebase APIs.

### Alternatives rejected

_(to be documented)_

### Consequences

- Fewer outdated/hallucinated Firebase API usages.
- Generated code is still reviewed by me, especially security rules and trigger idempotency (see `ai-review-log.md`).
