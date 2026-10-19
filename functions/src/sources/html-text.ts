const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: "\"",
  apos: "'",
  nbsp: " ",
};

/**
 * Decodes HTML entities in one pass, so "&amp;quot;" becomes "&quot;",
 * not a quote character.
 * @param {string} text Text with HTML entities.
 * @return {string} Decoded text; unknown entities are left as they are.
 */
export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi, (match, ref) => {
    const name = String(ref).toLowerCase();
    if (name.startsWith("#x")) {
      return String.fromCodePoint(parseInt(name.slice(2), 16));
    }
    if (name.startsWith("#")) {
      return String.fromCodePoint(parseInt(name.slice(1), 10));
    }
    return NAMED_ENTITIES[name] ?? match;
  });
}

/**
 * Converts an HTML fragment to plain text.
 * @param {string} html HTML fragment.
 * @return {string} Text without tags, entities decoded, whitespace collapsed.
 */
export function htmlToText(html: string): string {
  const withoutTags = html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]*>/g, " ");
  return decodeEntities(withoutTags).replace(/\s+/g, " ").trim();
}
