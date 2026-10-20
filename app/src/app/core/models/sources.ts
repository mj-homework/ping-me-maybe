/** Same IDs as `SourceId` in functions/src/sources/types.ts. */
export type SourceId = 'bbc-world' | 'bbc-business' | 'reddit-nottheonion';

export interface SourceOption {
  id: SourceId;
  name: string;
}

/**
 * The rule form reads this list, not the `sources` collection: those docs exist only after a
 * poll. Names match `SOURCES` in functions/src/sources/sources.ts.
 */
export const SOURCE_OPTIONS: readonly SourceOption[] = [
  { id: 'bbc-world', name: 'BBC World' },
  { id: 'bbc-business', name: 'BBC Business' },
  { id: 'reddit-nottheonion', name: 'Reddit r/nottheonion' },
];

/** Display name for a source ID; an unknown ID is returned as it is. */
export function sourceName(id: string): string {
  return SOURCE_OPTIONS.find((s) => s.id === id)?.name ?? id;
}
