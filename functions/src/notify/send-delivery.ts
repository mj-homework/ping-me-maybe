import { DocumentData, FieldValue, Firestore, Timestamp } from 'firebase-admin/firestore';
import { errorMessage } from '../shared/errors';
import { NormalizedEvent } from '../sources/types';
import { ChannelId, isChannelId, NotificationChannel } from './types';

/** What sendDelivery did with one delivery. */
export type SendOutcome = 'sent' | 'failed' | 'not-pending';

/**
 * Sends one delivery (design.md §3). The pending → sending transaction lets
 * only one trigger run through (idempotency 3); a crash after the send leaves
 * the delivery in `sending`, so delivery is at-most-once. A failed send is
 * recorded, not retried (A13).
 * @param {Firestore} db Admin Firestore.
 * @param {string} deliveryId `deliveries/{deliveryId}`.
 * @param {Partial<Record<ChannelId, NotificationChannel>>} registry Channels by ID.
 * @return {Promise<SendOutcome>} The outcome, for the log.
 */
export async function processDelivery(
  db: Firestore,
  deliveryId: string,
  registry: Partial<Record<ChannelId, NotificationChannel>>,
): Promise<SendOutcome> {
  const ref = db.collection('deliveries').doc(deliveryId);
  const delivery = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.data();
    if (data?.status !== 'pending') return null;
    tx.update(ref, { status: 'sending' });
    return data;
  });
  if (!delivery) return 'not-pending';

  try {
    const channelId: unknown = delivery.channel;
    const channel = isChannelId(channelId) ? registry[channelId] : undefined;
    if (!channel) throw new Error(`Channel "${String(channelId)}" not available`);
    await channel.send({
      deliveryId,
      userId: String(delivery.userId),
      ruleName: String(delivery.ruleName),
      event: await loadEvent(db, String(delivery.eventId)),
    });
  } catch (err) {
    await ref.update({ status: 'failed', error: errorMessage(err) });
    return 'failed';
  }
  await ref.update({ status: 'sent', sentAt: FieldValue.serverTimestamp() });
  return 'sent';
}

/**
 * @param {Firestore} db Admin Firestore.
 * @param {string} eventId `events/{eventId}`.
 * @return {Promise<NormalizedEvent>} The event; throws if missing or malformed.
 */
async function loadEvent(db: Firestore, eventId: string): Promise<NormalizedEvent> {
  const data: DocumentData | undefined = (await db.collection('events').doc(eventId).get()).data();
  if (!data) throw new Error(`Event ${eventId} not found`);
  if (!(data.publishedAt instanceof Timestamp)) {
    throw new Error(`Event ${eventId} has no publishedAt timestamp`);
  }
  return {
    sourceId: data.sourceId,
    externalId: String(data.externalId),
    category: data.category,
    title: String(data.title),
    summary: String(data.summary),
    url: String(data.url),
    publishedAt: data.publishedAt.toDate(),
    attributes: data.attributes ?? {},
  };
}
