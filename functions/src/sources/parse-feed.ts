import {XMLParser, XMLValidator} from "fast-xml-parser";
import {htmlToText} from "./html-text";
import {FeedItem} from "./types";

/** A feed that cannot be parsed; the message is meant for humans. */
export class FeedParseError extends Error {
  /**
   * @param {string} message Readable reason, stored as the source's lastError.
   */
  constructor(message: string) {
    super(message);
    this.name = "FeedParseError";
  }
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  // Keep titles like "2026" as strings.
  parseTagValue: false,
  isArray: (_name, jpath) =>
    jpath === "rss.channel.item" || jpath === "feed.entry",
});

type XmlNode = Record<string, unknown>;

/**
 * Parses an RSS 2.0 or Atom feed. The format is picked by the root element.
 * Items without an ID or a valid date are skipped; duplicate IDs within one
 * feed are collapsed to the first occurrence.
 * @param {string} xml Raw feed body.
 * @return {FeedItem[]} Items in feed order.
 */
export function parseFeed(xml: string): FeedItem[] {
  const validation = XMLValidator.validate(xml);
  if (validation !== true) {
    const {msg, line} = validation.err;
    throw new FeedParseError(`Invalid XML at line ${line}: ${msg}`);
  }
  const doc = parser.parse(xml) as XmlNode;

  let items: (FeedItem | null)[];
  if (isNode(doc.rss)) {
    const channel = doc.rss.channel;
    items = asNodes(isNode(channel) ? channel.item : undefined).map(rssItem);
  } else if (isNode(doc.feed)) {
    items = asNodes(doc.feed.entry).map(atomEntry);
  } else {
    throw new FeedParseError(
      "Unsupported feed format: expected <rss> or <feed>",
    );
  }

  const seen = new Set<string>();
  return items.filter((item): item is FeedItem => {
    if (item === null || seen.has(item.externalId)) return false;
    seen.add(item.externalId);
    return true;
  });
}

/**
 * Maps an RSS 2.0 <item>.
 * @param {XmlNode} item Parsed <item>.
 * @return {FeedItem | null} The item, or null if it has no ID or date.
 */
function rssItem(item: XmlNode): FeedItem | null {
  // BBC appends a "#N" fragment that differs between copies of the same
  // story (ADR-013), so it is not part of the identity.
  const guid = text(item.guid).replace(/#\d+$/, "");
  const externalId = guid || text(item.link);
  const publishedAt = new Date(text(item.pubDate));
  if (!externalId || isNaN(publishedAt.getTime())) return null;
  return {
    externalId,
    title: htmlToText(text(item.title)),
    summary: htmlToText(text(item.description)),
    url: text(item.link),
    publishedAt,
    attributes: {},
  };
}

/**
 * Maps an Atom <entry> (Reddit).
 * @param {XmlNode} entry Parsed <entry>.
 * @return {FeedItem | null} The item, or null if it has no ID or date.
 */
function atomEntry(entry: XmlNode): FeedItem | null {
  const externalId = text(entry.id);
  const publishedAt = new Date(text(entry.published) || text(entry.updated));
  if (!externalId || isNaN(publishedAt.getTime())) return null;
  const author = isNode(entry.author) ? text(entry.author.name) : "";
  return {
    externalId,
    title: htmlToText(text(entry.title)),
    summary: redditSummary(text(entry.content)),
    url: atomLink(entry.link),
    publishedAt,
    attributes: author ? {author} : {},
  };
}

/**
 * Reddit link posts only carry "submitted by … [link] [comments]"
 * boilerplate; only self posts have a body in <div class="md">.
 * @param {string} contentHtml Decoded <content type="html">.
 * @return {string} The self-post text, or "" for link posts.
 */
function redditSummary(contentHtml: string): string {
  const match = /<div class="md">([\s\S]*)<\/div>\s*<!-- SC_ON -->/.exec(
    contentHtml,
  );
  return match ? htmlToText(match[1]) : "";
}

/**
 * @param {unknown} link Parsed Atom <link> element(s).
 * @return {string} The alternate link href, or "".
 */
function atomLink(link: unknown): string {
  const links = asNodes(link);
  const alternate =
    links.find((l) => !l["@_rel"] || l["@_rel"] === "alternate") ?? links[0];
  return alternate ? text(alternate["@_href"]) : "";
}

/**
 * @param {unknown} value Parsed element: string, or node with "#text".
 * @return {string} Its trimmed text content, or "".
 */
function text(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (isNode(value)) return text(value["#text"]);
  return "";
}

/**
 * @param {unknown} value Any parsed value.
 * @return {boolean} True if it is an element node.
 */
function isNode(value: unknown): value is XmlNode {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * @param {unknown} value One node, an array of nodes, or nothing.
 * @return {XmlNode[]} The nodes as an array.
 */
function asNodes(value: unknown): XmlNode[] {
  const list = Array.isArray(value) ? value : [value];
  return list.filter(isNode);
}
