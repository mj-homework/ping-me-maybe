import { readFileSync } from 'node:fs';
import * as path from 'node:path';

// Same relative location from src/scripts and from the compiled lib/scripts.
const FIREBASERC = path.join(__dirname, '..', '..', '..', '.firebaserc');

/**
 * @return {string} The default project ID from .firebaserc, so the data
 *   lands in the namespace the Emulator UI shows.
 */
export function defaultProjectId(): string {
  const rc = JSON.parse(readFileSync(FIREBASERC, 'utf8')) as { projects?: { default?: unknown } };
  const projectId = rc.projects?.default;
  if (typeof projectId !== 'string') throw new Error(`No default project in ${FIREBASERC}`);
  return projectId;
}
