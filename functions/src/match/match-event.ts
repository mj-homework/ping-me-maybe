import { DocumentData, FieldValue, Firestore, Timestamp } from 'firebase-admin/firestore';
import { ChannelId, isChannelId } from '../notify/types';
import { errorMessage, isAlreadyExists } from '../shared/errors';
import { SOURCES } from '../sources/sources';
import { SourceId } from '../sources/types';
import { MatchableEvent, MatchableRule, matchRules } from './match-rules';

/** A `rules/{ruleId}` document with the fields matchEvent needs. */
interface StoredRule extends MatchableRule {
  id: string;
  userId: string;
  name: string;
  channels: ChannelId[];
}

/** What matchEvent did for one event, for the one-line log. */
export interface MatchSummary {
  eventId: string;
  activeRules: number;
  matchedRules: number;
  created: number;
  skipped: number;
  failed: number;
  invalid: string[];
}

/**
 * Matches one new event against all active rules and creates one pending
 * delivery per matched rule and channel (design.md §3). The delivery ID is
 * deterministic and written with create(), so a re-run of the trigger creates
 * nothing new (idempotency 2).
 * @param {Firestore} db Admin Firestore.
 * @param {string} eventId ID of the new event.
 * @param {DocumentData} data The event document.
 * @return {Promise<MatchSummary>} Counts for the log.
 */
export async function createDeliveries(
  db: Firestore,
  eventId: string,
  data: DocumentData,
): Promise<MatchSummary> {
  const summary: MatchSummary = {
    eventId,
    activeRules: 0,
    matchedRules: 0,
    created: 0,
    skipped: 0,
    failed: 0,
    invalid: [],
  };
  const event = toMatchableEvent(data);
  if (!event) {
    summary.invalid.push(`events/${eventId}`);
    return summary;
  }

  const snapshot = await db.collection('rules').where('active', '==', true).get();
  summary.activeRules = snapshot.size;
  const rules: StoredRule[] = [];
  for (const doc of snapshot.docs) {
    const rule = toStoredRule(doc.id, doc.data());
    if (rule) rules.push(rule);
    else summary.invalid.push(`rules/${doc.id}`);
  }

  const matched = matchRules(event, rules);
  summary.matchedRules = matched.length;

  const writes = matched.flatMap((rule) =>
    rule.channels.map((channel) => {
      const id = `${eventId}_${rule.id}_${channel}`;
      return db
        .collection('deliveries')
        .doc(id)
        .create({
          eventId,
          ruleId: rule.id,
          userId: rule.userId,
          channel,
          status: 'pending',
          error: null,
          eventTitle: event.title,
          eventUrl: event.url,
          sourceId: event.sourceId,
          ruleName: rule.name,
          createdAt: FieldValue.serverTimestamp(),
          sentAt: null,
        })
        .then(
          () => 'created' as const,
          (err: unknown) => {
            if (isAlreadyExists(err)) return 'skipped' as const;
            throw new Error(`deliveries/${id}: ${errorMessage(err)}`);
          },
        );
    }),
  );
  const results = await Promise.allSettled(writes);
  for (const result of results) {
    if (result.status === 'rejected') summary.failed++;
    else summary[result.value]++;
  }
  return summary;
}

/**
 * @param {DocumentData} data An `events/{eventId}` document.
 * @return {MatchableEvent | null} The fields the matcher needs plus the URL
 *   for the delivery snapshot, or null if the document has the wrong shape.
 */
function toMatchableEvent(data: DocumentData): (MatchableEvent & { url: string }) | null {
  const { sourceId, title, summary, url, ingestedAt } = data;
  if (
    !isSourceId(sourceId) ||
    typeof title !== 'string' ||
    typeof summary !== 'string' ||
    typeof url !== 'string' ||
    !(ingestedAt instanceof Timestamp)
  ) {
    return null;
  }
  return { sourceId, title, summary, url, ingestedAt: ingestedAt.toDate() };
}

/**
 * Rules are validated by firestore.rules except list items, so the lists are
 * filtered here; keywords are left to the matcher.
 * @param {string} id Rule document ID.
 * @param {DocumentData} data A `rules/{ruleId}` document.
 * @return {StoredRule | null} The rule, or null if a field has the wrong type.
 */
function toStoredRule(id: string, data: DocumentData): StoredRule | null {
  const { userId, name, sourceIds, keywords, channels, active, createdAt } = data;
  if (
    typeof userId !== 'string' ||
    typeof name !== 'string' ||
    !Array.isArray(sourceIds) ||
    !Array.isArray(keywords) ||
    !Array.isArray(channels) ||
    typeof active !== 'boolean' ||
    !(createdAt instanceof Timestamp)
  ) {
    return null;
  }
  return {
    id,
    userId,
    name,
    sourceIds: sourceIds.filter(isSourceId),
    keywords,
    channels: [...new Set(channels.filter(isChannelId))],
    active,
    createdAt: createdAt.toDate(),
  };
}

/**
 * @param {unknown} value Anything.
 * @return {boolean} True for a configured SourceId.
 */
function isSourceId(value: unknown): value is SourceId {
  return SOURCES.some((s) => s.id === value);
}
