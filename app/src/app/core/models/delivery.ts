import { ChannelId } from './rule';

export type DeliveryStatus = 'pending' | 'sending' | 'sent' | 'failed';

/** `deliveries/{eventId}_{ruleId}_{channel}` (design.md §1). */
export interface Delivery {
  id: string;
  eventId: string;
  ruleId: string;
  userId: string;
  channel: ChannelId;
  status: DeliveryStatus;
  /** Set only when `status` is `failed`. */
  error: string | null;
  eventTitle: string;
  eventUrl: string;
  sourceId: string;
  ruleName: string;
  createdAt: Date;
  /** Set only when `status` is `sent`. */
  sentAt: Date | null;
}
