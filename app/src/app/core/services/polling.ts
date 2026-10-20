import { Injectable, inject } from '@angular/core';
import { httpsCallable } from 'firebase/functions';
import { SourceId } from '../models/sources';
import { FIREBASE_FUNCTIONS } from './firebase';

/** Same shape as `SourcePollResult` in functions/src/poll/poll-all-sources.ts. */
export interface SourcePollResult {
  sourceId: SourceId;
  created: number;
  skipped: number;
  error: string | null;
}

/** Calls the admin-only `pollSourcesNow` callable (ADR-005). */
@Injectable({ providedIn: 'root' })
export class PollingService {
  private readonly pollSourcesNow = httpsCallable<void, { results: SourcePollResult[] }>(
    inject(FIREBASE_FUNCTIONS),
    'pollSourcesNow',
  );

  /** Polls every source once; throws a `FunctionsError` (e.g. `permission-denied`). */
  async fetchNow(): Promise<SourcePollResult[]> {
    const { data } = await this.pollSourcesNow();
    return data.results;
  }
}
