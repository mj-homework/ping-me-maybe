import { ReplaySourceAdapter } from '../sources/replay-source-adapter';
import { SOURCES } from '../sources/sources';
import { SourceAdapter } from '../sources/types';

/**
 * Picks the adapters for SOURCE_MODE (ADR-013). Only "replay" exists so far;
 * "live" comes with the HTTP adapter.
 * @param {string} mode Value of SOURCE_MODE.
 * @return {SourceAdapter[]} One adapter per configured source.
 */
export function createAdapters(mode: string): SourceAdapter[] {
  if (mode === 'replay') return SOURCES.map((source) => new ReplaySourceAdapter(source));
  throw new Error(`Unsupported SOURCE_MODE "${mode}": only "replay" is implemented`);
}
