import {createHash} from "node:crypto";
import {SourceId} from "./types";

/**
 * Deterministic Firestore ID for an event (ADR-013). externalId can be a URL,
 * and Firestore IDs cannot contain "/", so it is hashed.
 * @param {SourceId} sourceId Source the event came from.
 * @param {string} externalId Normalized feed item ID.
 * @return {string} `{sourceId}_{first 32 hex chars of sha256(externalId)}`.
 */
export function eventId(sourceId: SourceId, externalId: string): string {
  const hash = createHash("sha256").update(externalId).digest("hex");
  return `${sourceId}_${hash.slice(0, 32)}`;
}
