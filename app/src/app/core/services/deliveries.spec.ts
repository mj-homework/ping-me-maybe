import { Timestamp } from 'firebase/firestore';
import { DeliveryDoc, toDelivery } from './deliveries';

const CREATED = new Date('2026-10-20T07:00:00Z');
const SENT = new Date('2026-10-20T07:00:05Z');

function deliveryDoc(overrides: Partial<DeliveryDoc> = {}): DeliveryDoc {
  return {
    eventId: 'bbc-world_abc',
    ruleId: 'rule-1',
    userId: 'alice',
    channel: 'email',
    status: 'pending',
    error: null,
    eventTitle: 'Earthquake',
    eventUrl: 'https://example.com/earthquake',
    sourceId: 'bbc-world',
    ruleName: 'Quakes',
    createdAt: Timestamp.fromDate(CREATED),
    sentAt: null,
    ...overrides,
  };
}

describe('toDelivery', () => {
  it('keeps null error and sentAt for a pending delivery', () => {
    const delivery = toDelivery('d1', deliveryDoc());
    expect(delivery.id).toBe('d1');
    expect(delivery.error).toBeNull();
    expect(delivery.sentAt).toBeNull();
    expect(delivery.createdAt).toEqual(CREATED);
  });

  it('converts sentAt for a sent delivery', () => {
    const delivery = toDelivery(
      'd1',
      deliveryDoc({ status: 'sent', sentAt: Timestamp.fromDate(SENT) }),
    );
    expect(delivery.sentAt).toEqual(SENT);
    expect(delivery.error).toBeNull();
  });

  it('keeps the error of a failed delivery', () => {
    const delivery = toDelivery(
      'd1',
      deliveryDoc({ status: 'failed', error: 'Connection timeout' }),
    );
    expect(delivery.error).toBe('Connection timeout');
    expect(delivery.sentAt).toBeNull();
  });
});
