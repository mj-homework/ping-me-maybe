import { FieldValue, Firestore, GrpcStatus } from 'firebase-admin/firestore';
import { describe, expect, it } from 'vitest';
import { eventId } from '../sources/event-id';
import { SOURCES } from '../sources/sources';
import { NormalizedEvent, SourceAdapter, SourceConfig, SourceId } from '../sources/types';
import { pollAllSources } from './poll-all-sources';

type DocData = Record<string, unknown>;

/** Just the Firestore surface pollAllSources uses: collection().doc().create()/set(). */
class FakeFirestore {
  readonly docs = new Map<string, DocData>();

  /**
   * @param {string} name Collection name.
   * @return {object} Collection with doc().
   */
  collection(name: string) {
    return { doc: (id: string) => new FakeDoc(this.docs, `${name}/${id}`) };
  }

  /**
   * @param {string} path `collection/id`.
   * @return {DocData} The stored document; fails the test if missing.
   */
  get(path: string): DocData {
    const data = this.docs.get(path);
    expect(data, path).toBeDefined();
    return data as DocData;
  }

  /** @return {Firestore} This fake, typed for pollAllSources. */
  asFirestore(): Firestore {
    return this as unknown as Firestore;
  }
}

/** A document reference backed by the fake's map. */
class FakeDoc {
  /**
   * @param {Map<string, DocData>} docs Shared document store.
   * @param {string} path `collection/id`.
   */
  constructor(
    private readonly docs: Map<string, DocData>,
    private readonly path: string,
  ) {}

  /**
   * Like the real create(): fails with ALREADY_EXISTS on an existing doc.
   * @param {DocData} data Document data.
   */
  async create(data: DocData): Promise<void> {
    if (this.docs.has(this.path)) {
      throw Object.assign(new Error(`6 ALREADY_EXISTS: Document already exists: ${this.path}`), {
        code: GrpcStatus.ALREADY_EXISTS,
      });
    }
    this.docs.set(this.path, data);
  }

  /**
   * @param {DocData} data Fields to write.
   * @param {object} options Only `{ merge: true }` is used by the poller.
   */
  async set(data: DocData, options: { merge?: boolean } = {}): Promise<void> {
    const old = options.merge ? (this.docs.get(this.path) ?? {}) : {};
    this.docs.set(this.path, { ...old, ...data });
  }
}

/**
 * @param {SourceId} id Configured source.
 * @return {SourceConfig} Its config.
 */
function source(id: SourceId): SourceConfig {
  const config = SOURCES.find((s) => s.id === id);
  if (!config) throw new Error(`${id} is not configured`);
  return config;
}

/**
 * @param {SourceConfig} config Source of the events.
 * @param {string[]} externalIds One event per ID.
 * @return {NormalizedEvent[]} Minimal events.
 */
function events(config: SourceConfig, externalIds: string[]): NormalizedEvent[] {
  return externalIds.map((externalId) => ({
    sourceId: config.id,
    category: config.category,
    externalId,
    title: `Title ${externalId}`,
    summary: '',
    url: `https://example.com/${externalId}`,
    publishedAt: new Date('2026-10-19T20:00:00Z'),
    attributes: {},
  }));
}

/**
 * @param {SourceConfig} config Source the adapter serves.
 * @param {NormalizedEvent[] | Error} result Events to return, or an error to throw.
 * @return {SourceAdapter} Adapter with a fixed result.
 */
function adapter(config: SourceConfig, result: NormalizedEvent[] | Error): SourceAdapter {
  return {
    source: config,
    fetchEvents: async () => {
      if (result instanceof Error) throw result;
      return result;
    },
  };
}

const world = source('bbc-world');
const reddit = source('reddit-nottheonion');

describe('pollAllSources', () => {
  it('creates every event on the first run', async () => {
    const db = new FakeFirestore();
    const results = await pollAllSources(db.asFirestore(), [
      adapter(world, events(world, ['w1', 'w2', 'w3'])),
      adapter(reddit, events(reddit, ['t3_a', 't3_b'])),
    ]);

    expect(results).toEqual([
      { sourceId: 'bbc-world', created: 3, skipped: 0, error: null },
      { sourceId: 'reddit-nottheonion', created: 2, skipped: 0, error: null },
    ]);
    const event = db.get(`events/${eventId('bbc-world', 'w1')}`);
    expect(event.externalId).toBe('w1');
    expect(event.title).toBe('Title w1');
    expect(FieldValue.serverTimestamp().isEqual(event.ingestedAt as FieldValue)).toBe(true);
    expect([...db.docs.keys()].filter((k) => k.startsWith('events/'))).toHaveLength(5);
  });

  it('skips everything on a second run with the same events', async () => {
    const db = new FakeFirestore();
    const adapters = [adapter(world, events(world, ['w1', 'w2', 'w3']))];
    await pollAllSources(db.asFirestore(), adapters);

    const results = await pollAllSources(db.asFirestore(), adapters);

    expect(results).toEqual([{ sourceId: 'bbc-world', created: 0, skipped: 3, error: null }]);
    expect([...db.docs.keys()].filter((k) => k.startsWith('events/'))).toHaveLength(3);
    expect(db.get('sources/bbc-world')).toMatchObject({ lastItemCount: 3, lastNewCount: 0 });
  });

  it('records a failing source and still polls the others', async () => {
    const db = new FakeFirestore();
    const results = await pollAllSources(db.asFirestore(), [
      adapter(world, new Error('Feed returned HTTP 503')),
      adapter(reddit, events(reddit, ['t3_a', 't3_b'])),
    ]);

    expect(results).toEqual([
      { sourceId: 'bbc-world', created: 0, skipped: 0, error: 'Feed returned HTTP 503' },
      { sourceId: 'reddit-nottheonion', created: 2, skipped: 0, error: null },
    ]);
    const failed = db.get('sources/bbc-world');
    expect(failed.lastError).toBe('Feed returned HTTP 503');
    expect(failed.lastPolledAt).toBeDefined();
    expect(failed.lastSuccessAt).toBeUndefined();
    expect(db.get(`events/${eventId('reddit-nottheonion', 't3_a')}`)).toBeDefined();
  });

  it('sets lastError to null and lastPolledAt on success', async () => {
    const db = new FakeFirestore();
    // A previous failure must be cleared by the next successful poll.
    await db.collection('sources').doc('bbc-world').set({ lastError: 'old error' });

    await pollAllSources(db.asFirestore(), [adapter(world, events(world, ['w1']))]);

    const status = db.get('sources/bbc-world');
    expect(status.lastError).toBeNull();
    expect(FieldValue.serverTimestamp().isEqual(status.lastPolledAt as FieldValue)).toBe(true);
    expect(FieldValue.serverTimestamp().isEqual(status.lastSuccessAt as FieldValue)).toBe(true);
    expect(status).toMatchObject({
      name: 'BBC World',
      category: 'world',
      lastItemCount: 1,
      lastNewCount: 1,
    });
  });
});
