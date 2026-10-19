import { NormalizedEvent } from '../sources/types';

export type ChannelId = 'email' | 'slack';

const CHANNEL_IDS: readonly ChannelId[] = ['email', 'slack'];

/**
 * @param {unknown} value Anything, e.g. a field read from Firestore.
 * @return {boolean} True for a known ChannelId.
 */
export function isChannelId(value: unknown): value is ChannelId {
  return CHANNEL_IDS.some((c) => c === value);
}

export type DeliveryStatus = 'pending' | 'sending' | 'sent' | 'failed';

/** What a channel needs to send one notification (design.md §2). */
export interface NotificationMessage {
  deliveryId: string;
  userId: string;
  ruleName: string;
  event: NormalizedEvent;
}

export interface NotificationChannel {
  readonly id: ChannelId;
  /** Resolves its own recipient; throws on failure. */
  send(message: NotificationMessage): Promise<void>;
}
