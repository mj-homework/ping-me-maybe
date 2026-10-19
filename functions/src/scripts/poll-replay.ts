/**
 * Dev script: runs one replay poll against the Firestore emulator, without
 * login or the Functions emulator. Usage: `npm run poll:replay` in functions/.
 */
import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createAdapters } from '../poll/adapters';
import { pollAllSources } from '../poll/poll-all-sources';

// Same relative location from src/scripts and from the compiled lib/scripts.
const FIREBASERC = path.join(__dirname, '..', '..', '..', '.firebaserc');

/**
 * @return {string} The default project ID from .firebaserc, so the documents
 *   land in the namespace the Emulator UI shows.
 */
function defaultProjectId(): string {
  const rc = JSON.parse(readFileSync(FIREBASERC, 'utf8')) as { projects?: { default?: unknown } };
  const projectId = rc.projects?.default;
  if (typeof projectId !== 'string') throw new Error(`No default project in ${FIREBASERC}`);
  return projectId;
}

/** Polls all sources once in replay mode and prints the summary. */
async function main(): Promise<void> {
  // Emulator-only rule: without this variable the Admin SDK would try a real project.
  const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;
  if (!emulatorHost) {
    console.error('FIRESTORE_EMULATOR_HOST is not set – refusing to run outside the emulator.');
    process.exitCode = 1;
    return;
  }
  const projectId = defaultProjectId();
  initializeApp({ projectId });
  console.log(
    `Polling (replay) into the Firestore emulator at ${emulatorHost}, project ${projectId}`,
  );

  const results = await pollAllSources(getFirestore(), createAdapters('replay'));
  console.table(results);
  if (results.some((r) => r.error !== null)) process.exitCode = 1;
}

main().catch((err: unknown) => {
  console.error(err);
  process.exitCode = 1;
});
