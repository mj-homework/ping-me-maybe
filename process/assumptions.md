# Assumptions — Ping Me Maybe

> Phase 1: disambiguating the brief. Each item is a question I would ask the PM, plus the assumption I'm building on until told otherwise.
> Agreed in planning chat: 2026-10-19 14:46 – 14:57 (Europe/Budapest).
> **Updated:** 2026-10-19 15:51 – A2 extended with BBC World; A11 clarified (Slack = Should, after email). Aligned with `scope.md`.
> **Updated:** 2026-10-19 16:59 – A2: feed URLs and Reddit access verified with curl (User-Agent required, Reddit returns Atom). A3: dedup key covers Atom `<id>`.
> **Updated:** 2026-10-19 17:53 – A7: keywords are OR-ed, not AND-ed (ADR-014). A12: `ChannelAdapter` renamed to `NotificationChannel` (ADR-013).
> Status: **Confirmed** = explicitly decided by me · **Default** = proposed, accepted without change.

## What & where from

| # | Question | Assumption | Status |
|---|---|---|---|
| A1 | What counts as "something important"? | Importance is **user-defined via rules**, not decided by the system. A rule matches on source/category + keyword conditions on title/summary. No ML / "AI importance" scoring. | Default |
| A2 | Which sources? | Three **real** public feeds, no API keys: **BBC World** (breaking news, disasters via keywords), **BBC Business** (economic news) and **Reddit r/nottheonion** (the playful one). Earthquakes (USGS) rejected: unlikely to produce a relevant event during a demo. Recorded feed snapshots are used as test fixtures. *(15:51: BBC World added so all three brief categories are covered.)* **Verified 16:59 (curl):** BBC World `https://feeds.bbci.co.uk/news/world/rss.xml` and BBC Business `https://feeds.bbci.co.uk/news/business/rss.xml` are RSS 2.0, no User-Agent needed. r/nottheonion `https://www.reddit.com/r/nottheonion/.rss` returns **403 without a User-Agent** and **200 with a custom one**, and the format is **Atom**, not RSS. → Two feed formats, one parser; the adapter always sends a custom User-Agent. | Confirmed |
| A3 | What is a normalized event? | `{ sourceId, externalId, category, title, summary, url, publishedAt, attributes{} }`. Dedup key: `sourceId + externalId` (RSS `guid`/link, Atom `<id>`). | Default |
| A4 | How fresh must alerts be? | Polling every few minutes + admin "Fetch now". No real-time push/streaming. | Default |
| A5 | Do new rules match past events? | No — only events ingested after the rule exists. | Default |

## Users & rules

| # | Question | Assumption | Status |
|---|---|---|---|
| A6 | Who are the users? | Anyone who signs up with email/password (Firebase Auth). Single tenant, no teams. | Default |
| A7 | What can a rule express? | Name, source/category, keywords, channel(s), active toggle. A rule matches if the event's source is in the rule's sources **and any** of its keywords appears in title + summary (case-insensitive). Keywords are OR-ed, not AND-ed. *(17:53: was "AND logic only", ADR-014.)* | Confirmed |
| A9 | Noise control (bursts of matching news)? | Out of MVP: no digests, throttling, quiet hours. Known risk; per-rule cooldown is the first candidate. | Default |

*(A8 — geographic filtering — dropped together with the earthquake source.)*

## Channels

| # | Question | Assumption | Status |
|---|---|---|---|
| A10 | Email to where? | The user's account email. Locally delivered to Mailpit/Ethereal; nothing real is sent. **Email is the primary MVP channel.** | Confirmed |
| A11 | Slack how? | **Stretch goal (Should), started only after email passes its acceptance criteria** (ADR-011). If built: user pastes their own incoming webhook URL. Known downsides: the URL is a secret (leak = anyone can post), clunky setup for users, fixed channel, silent failure if revoked. | Confirmed |
| A12 | What does "add more channels later" mean? | `NotificationChannel` interface + registry *(renamed, ADR-013)*. New channel = one adapter + one registration line; matching code untouched. Slack later is the proof. | Default |
| A13 | Failed deliveries? | Recorded with status + error; no automatic retry in MVP; visible in admin view. | Default |
| A14 | Duplicate notifications? | At most one delivery per `event × rule × channel`: deterministic ID `{eventId}_{ruleId}_{channel}` + `create()`. | Default |

## Admin

| # | Question | Assumption | Status |
|---|---|---|---|
| A15 | What is the admin view? | Views: ingested events, delivery log, all users' rules, sources + "Fetch now" (works from day one). **Write actions (e.g. disable rule, retry delivery) are present in the UI but disabled** in the first round; enabled one by one as time allows. | Confirmed |
| A16 | How does someone become admin? | `admin: true` custom claim set by a seed script against the emulator. No in-app role management. | Default |

## Non-functional

| # | Question | Assumption | Status |
|---|---|---|---|
| A17 | Scale? | Demo scale. Load active rules and match in memory; documented as the first thing to change at scale. | Default |
| A18 | Language / time? | English UI. Store UTC, display local time. | Default |
| A19 | Data retention? | Not handled in MVP. | Default |
