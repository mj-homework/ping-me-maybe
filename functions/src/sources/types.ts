export type SourceId = "bbc-world" | "bbc-business" | "reddit-nottheonion";

export type EventCategory = "world" | "business" | "oddities";

export interface SourceConfig {
  id: SourceId;
  name: string;
  category: EventCategory;
  url: string;
  /** File name in functions/fixtures/, served by the replay adapter. */
  replayFixture: string;
}

/** One feed item, independent of the source it came from. */
export interface FeedItem {
  externalId: string;
  title: string;
  summary: string;
  url: string;
  publishedAt: Date;
  attributes: Record<string, string>;
}

export interface NormalizedEvent extends FeedItem {
  sourceId: SourceId;
  category: EventCategory;
}

export interface SourceAdapter {
  readonly source: SourceConfig;
  fetchEvents(signal: AbortSignal): Promise<NormalizedEvent[]>;
}
