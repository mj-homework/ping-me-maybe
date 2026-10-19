import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { setGlobalOptions } from 'firebase-functions';
import { HttpsError, onCall } from 'firebase-functions/https';
import * as logger from 'firebase-functions/logger';
import { defineString } from 'firebase-functions/params';
import { createAdapters } from './poll/adapters';
import { pollAllSources } from './poll/poll-all-sources';

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
