import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { setGlobalOptions } from 'firebase-functions';
import { onDocumentCreated } from 'firebase-functions/firestore';
import { HttpsError, onCall } from 'firebase-functions/https';
import * as logger from 'firebase-functions/logger';
import { defineString } from 'firebase-functions/params';
import { createDeliveries } from './match/match-event';
import { channelRegistry } from './notify/channel-registry';
import { processDelivery } from './notify/send-delivery';
import { createAdapters } from './poll/adapters';
import { pollAllSources } from './poll/poll-all-sources';
import { errorMessage } from './shared/errors';

// For cost control: at most 10 containers per function.
setGlobalOptions({ maxInstances: 10 });

initializeApp();

/** `live` or `replay` (ADR-013); only `replay` is implemented. */
const sourceMode = defineString('SOURCE_MODE', { default: 'replay' });

/** Admin-only "fetch now" (ADR-005, ADR-013). */
export const pollSourcesNow = onCall(async (request) => {
  if (request.auth?.token.admin !== true) {
    throw new HttpsError('permission-denied', 'Only admins can poll the sources.');
  }
  const results = await pollAllSources(getFirestore(), createAdapters(sourceMode.value()));
  logger.info('pollSourcesNow finished', { results });
  return { results };
});

/** New event → pending deliveries for every matching rule and channel (design.md §3). */
export const matchEvent = onDocumentCreated('events/{eventId}', async (event) => {
  if (!event.data) return;
  try {
    const summary = await createDeliveries(getFirestore(), event.params.eventId, event.data.data());
    logger.info(
      `matchEvent ${summary.eventId}: ${summary.activeRules} active rules, ` +
        `${summary.matchedRules} matched, deliveries ${summary.created} created / ` +
        `${summary.skipped} existing / ${summary.failed} failed`,
      summary,
    );
  } catch (err) {
    // No retry: a missed match is accepted for the MVP (design.md §3).
    logger.error(`matchEvent ${event.params.eventId} failed: ${errorMessage(err)}`);
  }
});

/** New delivery → send it once through its channel (design.md §3). */
export const sendDelivery = onDocumentCreated('deliveries/{deliveryId}', async (event) => {
  const { deliveryId } = event.params;
  try {
    const outcome = await processDelivery(getFirestore(), deliveryId, channelRegistry);
    logger.info(`sendDelivery ${deliveryId}: ${outcome}`);
  } catch (err) {
    // Never crash (A13): only a failed status write can land here.
    logger.error(`sendDelivery ${deliveryId} failed: ${errorMessage(err)}`);
  }
});
