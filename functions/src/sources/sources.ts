import {SourceConfig} from "./types";

/** Source definitions live in code; runtime state lives in Firestore. */
export const SOURCES: readonly SourceConfig[] = [
  {
    id: "bbc-world",
    name: "BBC World",
    category: "world",
    url: "https://feeds.bbci.co.uk/news/world/rss.xml",
    replayFixture: "bbc-world.xml",
  },
  {
    id: "bbc-business",
    name: "BBC Business",
    category: "business",
    url: "https://feeds.bbci.co.uk/news/business/rss.xml",
    replayFixture: "bbc-business.xml",
  },
  {
    id: "reddit-nottheonion",
    name: "Reddit r/nottheonion",
    category: "oddities",
    url: "https://www.reddit.com/r/nottheonion/.rss",
    // Curated file with deterministic match / no-match cases for the demo.
    replayFixture: "reddit-nottheonion.demo.xml",
  },
];
