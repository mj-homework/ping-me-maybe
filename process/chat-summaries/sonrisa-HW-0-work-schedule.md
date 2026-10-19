# Munkaterv a beadásig – Ping Me Maybe

> **Készült:** 2026-10-19 16:41 (Europe/Budapest)
> **Forrás:** tervező chat (Claude), 16:37 és 16:40 közötti válaszok
> **Beadás:** 2026-10-20 13:00

## Hol tartunk

- ~3,5 óra van mögöttünk, ~20 óra van hátra.
- A process-dokumentáció (assumptions, scope, ADR-ek, review log) bőven elég – mostantól **a kódnak kell beszélnie**.

## Ami még hiányzik a kódolás előtt: rövid Phase 3 design (~30 perc)

Egy tömör `process/design.md` – nem újabb esszé. Enélkül az AI maga találja ki a Firestore-sémát és az interfészeket, és jön a javítgatás.

Tartalma:

- **Firestore kollekciók** és mezőik: `events`, `rules`, `deliveries`, `sources` – és ki olvashatja / írhatja őket (ebből lesznek a security rules).
- **Három interfész:** `SourceAdapter`, `NotificationChannel`, `Event`.
- **A pipeline egy ábrán:**
  `poll → normalize → events create → trigger → match → deliveries create → send`

Az IDE Claude-tól csak **javaslatot** kérünk az `assumptions.md` és a `scope.md` alapján, kód nélkül – a döntés az enyém.

## Menetrend

| Mikor | Mit |
|---|---|
| **16:40 – 17:15** | Két config fix (`.firebaserc`, deny-all `firestore.rules`) + `design.md` + 5 perc curl a BBC és Reddit RSS-re (élnek-e, kell-e User-Agent) |
| **17:15 – 19:00** | **M3 – Ingestion:** replay adapter fixture-rel + teszt, élő RSS adapter, `pollSourcesNow`. **Commit + push 19:00 előtt** |
| **19:00 – 20:30** | 👨‍👩‍👧 Család – kemény határ |
| **20:30 – 22:30** | **M1 + M2:** auth, szabály CRUD, security rules + rules tesztek |
| **22:30 – 00:30** | **M4:** matcher + email (Mailpit) + idempotencia – a „működik!” pillanat 🎉 |
| **éjjel** | Alvás. A cut lines-t nem hajnali 3-kor kell meghozni. |
| **reggel – 10:30** | **M5 + M6:** admin nézet, Fetch now gomb, guard |
| **10:30 – 11:30** | **S1 – Slack**, ha belefér |
| **11:30 – 13:00** | README, demó próba, logok lezárása, végső push |

## Miért az ingestion az első, és nem a UI?

Abban a legnagyobb a bizonytalanság (élő feedek, formátumok, dedup), és UI nélkül is tesztelhető. Ha ott meglepetés ér, korán derüljön ki.

## Szabályok a szünetekhez

- **Szünet előtt mindig commit + push**, még ha nincs is kész. Egy félkész, de pusholt állapot jobb, mint egy elfelejtett lokális.
- **Felállás előtt 2–3 sor a `plan.md`-be:** hol tartok, mi a következő lépés. Visszaérve nem kell visszafejteni, és a reviewer is látja, hogy a megszakítás tervezett volt.

## Ha csúszik

- Ha az **M4 éjfélig nem lesz kész**: reggel az az első, és az admin nézet szűkül.
- A vágási sorrend a `scope.md` 5. pontjában van (cut lines). Soha nem vágjuk: idempotencia, security rules, `ai-review-log.md`, README.
