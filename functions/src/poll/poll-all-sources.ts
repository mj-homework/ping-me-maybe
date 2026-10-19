import { FieldValue, Firestore } from 'firebase-admin/firestore';
import { errorMessage, isAlreadyExists } from '../shared/errors';
import { eventId } from '../sources/event-id';
import { NormalizedEvent, SourceAdapter, SourceId } from '../sources/types';

/** Per-source fetch timeout (design.md §3). */
const FETCH_TIMEOUT_MS = 10_000;

/** What one poll did for one source. */
export interface SourcePollResult {
  sourceId: SourceId;
  created: number;
  skipped: number;
  error: string | null;
}

/**
 * Fetches every source and writes new events. Sources run in parallel and a
 * failing source does not stop the others; its error ends up in
 * `sources/{sourceId}.lastError` and in the returned summary.
 * @param {Firestore} db Admin Firestore.
 * @param {SourceAdapter[]} adapters One adapter per source.
 * @param {number} timeoutMs Fetch timeout per source.
 * @return {Promise<SourcePollResult[]>} One result per adapter, same order.
 */
export async function pollAllSources(
  db: Firestore,
  adapters: readonly SourceAdapter[],
  timeoutMs: number = FETCH_TIMEOUT_MS,
): Promise<SourcePollResult[]> {
  const settled = await Promise.allSettled(adapters.map((a) => pollSource(db, a, timeoutMs)));
  return settled.map((result, i) => {
    if (result.status === 'fulfilled') return result.value;
    // Only reached if even the sources/{id} status write failed.
    const error = errorMessage(result.reason);
    return { sourceId: adapters[i].source.id, created: 0, skipped: 0, error };
  });
}

/**
 * @param {Firestore} db Admin Firestore.
 * @param {SourceAdapter} adapter Source to poll.
 * @param {number} timeoutMs Fetch timeout.
 * @return {Promise<SourcePollResult>} Counts and error of this source.
 */
async function pollSource(
  db: Firestore,
  adapter: SourceAdapter,
  timeoutMs: number,
): Promise<SourcePollResult> {
  const { source } = adapter;
  const sourceRef = db.collection('sources').doc(source.id);
  const now = FieldValue.serverTimestamp();
  const base = { name: source.name, category: source.category, lastPolledAt: now };

  let events: NormalizedEvent[];
  try {
    events = await adapter.fetchEvents(AbortSignal.timeout(timeoutMs));
  } catch (err) {
    const error = errorMessage(err);
    await sourceRef.set({ ...base, lastError: error }, { merge: true });
    return { sourceId: source.id, created: 0, skipped: 0, error };
  }

  const writes = await Promise.allSettled(events.map((e) => createEvent(db, e)));
  const created = writes.filter((w) => w.status === 'fulfilled' && w.value === 'created').length;
  const skipped = writes.filter((w) => w.status === 'fulfilled' && w.value === 'skipped').length;
  const failed = writes.find((w): w is PromiseRejectedResult => w.status === 'rejected');
  const error = failed ? `Writing events failed: ${errorMessage(failed.reason)}` : null;

  await sourceRef.set(
    {
      ...base,
      ...(error ? {} : { lastSuccessAt: now }),
      lastError: error,
      lastItemCount: events.length,
      lastNewCount: created,
    },
    { merge: true },
  );
  return { sourceId: source.id, created, skipped, error };
}

/**
 * Writes the event with create(), so an existing ID is a duplicate, not an
 * overwrite (idempotency 1, design.md §3).
 * @param {Firestore} db Admin Firestore.
 * @param {NormalizedEvent} event Event to store.
 * @return {Promise<'created' | 'skipped'>} Whether a new document was written.
 */
async function createEvent(db: Firestore, event: NormalizedEvent): Promise<'created' | 'skipped'> {
  const ref = db.collection('events').doc(eventId(event.sourceId, event.externalId));
  try {
    await ref.create({ ...event, ingestedAt: FieldValue.serverTimestamp() });
    return 'created';
  } catch (err) {
    if (isAlreadyExists(err)) return 'skipped';
    throw err;
  }
}
