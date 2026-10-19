import { EmailChannel } from './email-channel';
import { ChannelId, NotificationChannel } from './types';

/**
 * Channels by ID (design.md §2). Partial until Slack exists: a delivery for a
 * channel missing here fails with "channel not available".
 */
export const channelRegistry: Partial<Record<ChannelId, NotificationChannel>> = {
  email: new EmailChannel(),
};
