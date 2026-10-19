import {readFile} from "node:fs/promises";
import * as path from "node:path";
import {parseFeed} from "./parse-feed";
import {NormalizedEvent, SourceAdapter, SourceConfig} from "./types";

// Same relative location from src/sources and from the compiled lib/sources.
const FIXTURES_DIR = path.join(__dirname, "..", "..", "fixtures");

/** Serves a recorded feed from functions/fixtures/ (ADR-010). */
export class ReplaySourceAdapter implements SourceAdapter {
  /**
   * @param {SourceConfig} source Source whose replayFixture is served.
   * @param {string} fixturesDir Directory holding the fixture files.
   */
  constructor(
    readonly source: SourceConfig,
    private readonly fixturesDir: string = FIXTURES_DIR,
  ) {}

  /**
   * @param {AbortSignal} signal Cancels the file read.
   * @return {Promise<NormalizedEvent[]>} Events from the fixture file.
   */
  async fetchEvents(signal: AbortSignal): Promise<NormalizedEvent[]> {
    const file = path.join(this.fixturesDir, this.source.replayFixture);
    const xml = await readFile(file, {encoding: "utf8", signal});
    return toEvents(this.source, xml);
  }
}

/**
 * Parses a feed body and tags each item with its source.
 * Shared by the replay and the live adapter.
 * @param {SourceConfig} source Source the feed belongs to.
 * @param {string} xml Raw feed body.
 * @return {NormalizedEvent[]} Normalized events.
 */
export function toEvents(source: SourceConfig, xml: string): NormalizedEvent[] {
  return parseFeed(xml).map((item) => ({
    ...item,
    sourceId: source.id,
    category: source.category,
  }));
}
