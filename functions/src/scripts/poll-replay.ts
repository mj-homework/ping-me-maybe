/**
 * Dev script: runs one replay poll against the Firestore emulator, without
 * login or the Functions emulator. Usage: `npm run poll:replay` in functions/.
 */
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createAdapters } from '../poll/adapters';
import { pollAllSources } from '../poll/poll-all-sources';
import { defaultProjectId } from './project-id';

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
