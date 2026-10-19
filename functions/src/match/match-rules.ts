import { SourceId } from '../sources/types';

/** The event fields the matcher reads. */
export interface MatchableEvent {
  sourceId: SourceId;
  title: string;
  summary: string;
  ingestedAt: Date;
}

/** The rule fields the matcher reads. */
export interface MatchableRule {
  active: boolean;
  sourceIds: readonly string[];
  /**
   * Untrusted: security rules cannot check list items (see the firestore.rules
   * header), so non-strings and blanks are skipped here.
   */
  keywords: readonly unknown[];
  createdAt: Date;
}

/**
 * Pure matcher (design.md §3). A rule matches when it is active, watches the
 * event's source, was created before the event was ingested (A5), and any of
 * its keywords is a case-insensitive substring of title + summary (ADR-014).
 * @param {MatchableEvent} event The new event.
 * @param {R[]} rules Candidate rules.
 * @return {R[]} The matching rules, in input order.
 */
export function matchRules<R extends MatchableRule>(
  event: MatchableEvent,
  rules: readonly R[],
): R[] {
  const text = `${event.title}\n${event.summary}`.toLowerCase();
  return rules.filter(
    (rule) =>
      rule.active === true &&
      rule.sourceIds.includes(event.sourceId) &&
      rule.createdAt.getTime() < event.ingestedAt.getTime() &&
      usableKeywords(rule.keywords).some((keyword) => text.includes(keyword)),
  );
}

/**
 * @param {unknown[]} keywords Keywords as stored.
 * @return {string[]} Trimmed, lower-cased, non-empty string keywords.
 */
function usableKeywords(keywords: readonly unknown[]): string[] {
  return keywords
    .filter((k): k is string => typeof k === 'string')
    .map((k) => k.trim().toLowerCase())
    .filter((k) => k.length > 0);
}
