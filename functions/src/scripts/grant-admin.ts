/**
 * Dev script: gives a user the `admin` custom claim in the Auth emulator (A16),
 * creating the user first if a password is given.
 * Usage: `npm run admin:grant -- <email> [password]` in functions/.
 */
import { initializeApp } from 'firebase-admin/app';
import { FirebaseAuthError, UserRecord, getAuth } from 'firebase-admin/auth';
import { defaultProjectId } from './project-id';

/**
 * @param {string} email The user's email.
 * @return {Promise<UserRecord | null>} The user, or null if there is none.
 */
async function findUser(email: string): Promise<UserRecord | null> {
  try {
    return await getAuth().getUserByEmail(email);
  } catch (err: unknown) {
    if (err instanceof FirebaseAuthError && err.code === 'auth/user-not-found') return null;
    throw err;
  }
}

/** Finds or creates the user and sets `admin: true`, keeping other claims. */
async function main(): Promise<void> {
  // Emulator-only rule: without this variable the Admin SDK would try a real project.
  const emulatorHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
  if (!emulatorHost) {
    console.error('FIREBASE_AUTH_EMULATOR_HOST is not set – refusing to run outside the emulator.');
    process.exitCode = 1;
    return;
  }
  const [email, password] = process.argv.slice(2);
  if (!email) {
    console.error('Usage: npm run admin:grant -- <email> [password]');
    process.exitCode = 1;
    return;
  }
  const projectId = defaultProjectId();
  initializeApp({ projectId });
  console.log(`Granting admin in the Auth emulator at ${emulatorHost}, project ${projectId}`);

  let user = await findUser(email);
  let created = false;
  if (user === null) {
    if (password === undefined) {
      console.error(`${email}: user not found – pass a password to create it.`);
      process.exitCode = 1;
      return;
    }
    user = await getAuth().createUser({ email, password });
    created = true;
  } else if (password !== undefined) {
    console.log('User already exists – the password argument was ignored.');
  }

  const claims = user.customClaims ?? {};
  const status = created ? 'created' : 'already existed';
  if (claims.admin === true) {
    console.log(`${email} (uid ${user.uid}, ${status}) is already admin – nothing changed.`);
    return;
  }
  await getAuth().setCustomUserClaims(user.uid, { ...claims, admin: true });
  console.log(`${email} (uid ${user.uid}, ${status}) is now admin.`);
  console.log(
    'If this user is signed in, sign out and in again so the new ID token has the claim.',
  );
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
