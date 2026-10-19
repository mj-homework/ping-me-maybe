import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseFeed } from '../sources/parse-feed';
import { MatchableEvent, MatchableRule, matchRules } from './match-rules';

const FIXTURES_DIR = path.join(__dirname, '..', '..', 'fixtures');

const RULE_CREATED = new Date('2026-10-19T10:00:00Z');
const INGESTED = new Date('2026-10-19T12:00:00Z');

/**
 * @param {Partial<MatchableEvent>} overrides Fields to change.
 * @return {MatchableEvent} A BBC World event ingested after RULE_CREATED.
 */
function event(overrides: Partial<MatchableEvent> = {}): MatchableEvent {
  return {
    sourceId: 'bbc-world',
    title: 'Earthquake hits coastal region',
    summary: 'Rescue teams are on their way.',
    ingestedAt: INGESTED,
    ...overrides,
  };
}

/**
 * @param {Partial<MatchableRule>} overrides Fields to change.
 * @return {MatchableRule} An active BBC World rule created before INGESTED.
 */
function rule(overrides: Partial<MatchableRule> = {}): MatchableRule {
  return {
    active: true,
    sourceIds: ['bbc-world'],
    keywords: ['earthquake'],
    createdAt: RULE_CREATED,
    ...overrides,
  };
}

describe('matchRules', () => {
  it('matches when one of several keywords appears', () => {
    const r = rule({ keywords: ['flood', 'earthquake', 'storm'] });
    expect(matchRules(event(), [r])).toEqual([r]);
  });

  it('is case-insensitive on both sides', () => {
    const r = rule({ keywords: ['EarthQuake'] });
    expect(matchRules(event({ title: 'EARTHQUAKE hits' }), [r])).toEqual([r]);
  });

  it('matches a keyword that is only in the summary', () => {
    const r = rule({ keywords: ['rescue'] });
    expect(matchRules(event({ title: 'Nothing here' }), [r])).toEqual([r]);
  });

  it('does not match a rule for another source', () => {
    expect(matchRules(event(), [rule({ sourceIds: ['bbc-business'] })])).toEqual([]);
  });

  it('does not match a paused rule', () => {
    expect(matchRules(event(), [rule({ active: false })])).toEqual([]);
  });

  it('does not match a rule created at or after ingestion (A5)', () => {
    const same = rule({ createdAt: INGESTED });
    const later = rule({ createdAt: new Date(INGESTED.getTime() + 1) });
    expect(matchRules(event(), [same, later])).toEqual([]);
  });

  it('skips non-string and blank keywords', () => {
    const junkOnly = rule({ keywords: [42, null, '', '   ', { k: 'earthquake' }] });
    const junkAndValid = rule({ keywords: [42, '  ', '  Earthquake  '] });
    expect(matchRules(event(), [junkOnly, junkAndValid])).toEqual([junkAndValid]);
  });

  it('matches the florida rule against the Reddit demo fixture', () => {
    const xml = readFileSync(path.join(FIXTURES_DIR, 'reddit-nottheonion.demo.xml'), 'utf8');
    const florida = rule({ sourceIds: ['reddit-nottheonion'], keywords: ['florida'] });
    const matched = parseFeed(xml).filter(
      (item) =>
        matchRules(
          {
            sourceId: 'reddit-nottheonion',
            title: item.title,
            summary: item.summary,
            ingestedAt: INGESTED,
          },
          [florida],
        ).length > 0,
    );
    // Title match (t3_pmm0001) and summary-only match (t3_pmm0002), see the fixture header.
    expect(matched.map((item) => item.externalId)).toEqual(['t3_pmm0001', 't3_pmm0002']);
  });
});
