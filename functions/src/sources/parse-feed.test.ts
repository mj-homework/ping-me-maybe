import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import { describe, expect, it } from 'vitest';
import { eventId } from './event-id';
import { FeedParseError, parseFeed } from './parse-feed';
import { ReplaySourceAdapter } from './replay-source-adapter';
import { SOURCES } from './sources';
import { FeedItem } from './types';

const FIXTURES_DIR = path.join(__dirname, '..', '..', 'fixtures');

/**
 * @param {string} file Fixture file name.
 * @return {FeedItem[]} Parsed items of the fixture.
 */
function parseFixture(file: string): FeedItem[] {
  return parseFeed(readFileSync(path.join(FIXTURES_DIR, file), 'utf8'));
}

/**
 * @param {FeedItem[]} items Parsed items.
 * @param {string} externalId ID to look up.
 * @return {FeedItem} The item; fails the test if missing.
 */
function byId(items: FeedItem[], externalId: string): FeedItem {
  const item = items.find((i) => i.externalId === externalId);
  expect(item, `item ${externalId}`).toBeDefined();
  return item as FeedItem;
}

describe('parseFeed – BBC RSS 2.0', () => {
  it('parses every item of bbc-world with id, title, url and date', () => {
    const items = parseFixture('bbc-world.xml');
    expect(items).toHaveLength(26);
    for (const item of items) {
      expect(item.externalId).toMatch(/^https:\/\/www\.bbc\.co\.uk\/news\//);
      expect(item.externalId).not.toMatch(/#\d+$/);
      expect(item.title).not.toBe('');
      expect(item.url).toMatch(/^https:\/\//);
      expect(item.publishedAt.getTime()).not.toBeNaN();
    }
  });

  it('bbc guid fragments collapse to one event', () => {
    const items = parseFixture('bbc-business.xml');
    const article = 'https://www.bbc.co.uk/news/articles/c60rl1xvjv89o';
    // 45 <item>s, two stories appear twice with different #N fragments.
    expect(items).toHaveLength(43);
    expect(items.filter((i) => i.externalId === article)).toHaveLength(1);

    const xml =
      '<rss><channel>' +
      '<item><guid>https://bbc.example/a#0</guid>' +
      '<pubDate>Sun, 18 Oct 2026 23:24:59 GMT</pubDate></item>' +
      '<item><guid>https://bbc.example/a#3</guid>' +
      '<pubDate>Sun, 18 Oct 2026 23:24:59 GMT</pubDate></item>' +
      '</channel></rss>';
    expect(parseFeed(xml).map((i) => i.externalId)).toEqual(['https://bbc.example/a']);
  });

  it('takes the CDATA title and description as plain text', () => {
    const item = parseFixture('bbc-world.xml')[0];
    expect(item.title).toBe('Australian MP critically injured after apparent car attack');
    expect(item.summary).toMatch(/^The independent politician is in hospital/);
    expect(item.publishedAt.toISOString()).toBe('2026-10-19T14:09:54.000Z');
  });
});

describe('parseFeed – Reddit Atom', () => {
  it('parses every live entry with a t3_ id', () => {
    const items = parseFixture('reddit-nottheonion.xml');
    expect(items).toHaveLength(25);
    for (const item of items) {
      expect(item.externalId).toMatch(/^t3_[a-z0-9]+$/);
      expect(item.url).toMatch(/^https:\/\/www\.reddit\.com\/r\/nottheonion\//);
    }
  });

  it('gives link posts an empty summary', () => {
    const items = parseFixture('reddit-nottheonion.xml');
    expect(byId(items, 't3_1x9web2').summary).toBe(''); // <table> link post
    expect(byId(items, 't3_1x9a22q').summary).toBe(''); // "submitted by" only
  });

  it('uses the md div text as the summary of a self post', () => {
    const item = byId(parseFixture('reddit-nottheonion.xml'), 't3_1x8qstr');
    expect(item.summary).toBe(
      '"Analysis by public and academic AI detection software shows that ' +
        'Michelin’s new Dallas reviews are not the work of its human ' +
        'inspectors."',
    );
    expect(item.summary).not.toContain('submitted by');
  });

  it('matches the curated demo cases', () => {
    const items = parseFixture('reddit-nottheonion.demo.xml');
    expect(items.map((i) => i.externalId)).toEqual([
      't3_pmm0001',
      't3_pmm0002',
      't3_pmm0003',
      't3_pmm0004',
    ]);
    expect(byId(items, 't3_pmm0001').title).toMatch(/^Florida man/);
    expect(byId(items, 't3_pmm0001').summary).toBe('');
    expect(byId(items, 't3_pmm0002').summary).toBe(
      'The incident happened at a beach town in florida last weekend.',
    );
    expect(byId(items, 't3_pmm0003').summary).toBe('');
    expect(byId(items, 't3_pmm0001').attributes).toEqual({
      author: '/u/pmm_fixture_user1',
    });
  });

  it('decodes HTML entities in title and summary (t3_pmm0004)', () => {
    const items = parseFixture('reddit-nottheonion.demo.xml');
    const item = byId(items, 't3_pmm0004');
    expect(item.title).toBe('Delivery robot & goose locked in 40-minute "standoff" on campus');
    expect(item.summary).toBe('Officials say the "robot & goose" standoff lasted 40 minutes.');
  });
});

describe('parseFeed – errors', () => {
  it('throws a readable error for malformed XML', () => {
    const xml = '<rss><channel><item><title>Broken</channel></rss>';
    expect(() => parseFeed(xml)).toThrow(FeedParseError);
    expect(() => parseFeed(xml)).toThrow(/^Invalid XML at line 1: /);
  });

  it('throws for well-formed XML that is not a feed', () => {
    expect(() => parseFeed('<html><body/></html>')).toThrow(
      'Unsupported feed format: expected <rss> or <feed>',
    );
  });
});

describe('eventId', () => {
  it('is deterministic, prefixed with the source and free of slashes', () => {
    const id = eventId('bbc-world', 'https://www.bbc.co.uk/news/articles/x');
    expect(id).toMatch(/^bbc-world_[0-9a-f]{32}$/);
    expect(eventId('bbc-world', 'https://www.bbc.co.uk/news/articles/x')).toBe(id);
    expect(eventId('bbc-world', 'https://www.bbc.co.uk/news/articles/y')).not.toBe(id);
  });
});

describe('ReplaySourceAdapter', () => {
  it("serves the source's fixture as normalized events", async () => {
    const source = SOURCES.find((s) => s.id === 'reddit-nottheonion');
    if (!source) throw new Error('reddit-nottheonion is not configured');
    const adapter = new ReplaySourceAdapter(source);
    const events = await adapter.fetchEvents(new AbortController().signal);
    expect(events).toHaveLength(4);
    for (const event of events) {
      expect(event.sourceId).toBe('reddit-nottheonion');
      expect(event.category).toBe('oddities');
    }
  });

  it('has a readable fixture for every configured source', async () => {
    for (const source of SOURCES) {
      const events = await new ReplaySourceAdapter(source).fetchEvents(
        new AbortController().signal,
      );
      expect(events.length, source.id).toBeGreaterThan(0);
    }
  });
});
