import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import {
  RulesTestContext,
  RulesTestEnvironment,
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  DocumentData,
  Firestore,
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

const ROOT_DIR = path.join(__dirname, '..', '..');
const PROJECT_ID: string = JSON.parse(
  readFileSync(path.join(ROOT_DIR, '.firebaserc'), 'utf8'),
).projects.default;

const OWNER = 'alice';
const OTHER = 'bob';
const ADMIN = 'admin-uid';
const RULE_ID = 'rule-1';
const PAST = Timestamp.fromDate(new Date('2020-01-01T00:00:00Z'));

let testEnv: RulesTestEnvironment;

/**
 * The test SDK returns a compat Firestore; the modular functions accept it at runtime.
 * @param {RulesTestContext} context A signed-in, signed-out or rules-disabled context.
 * @return {Firestore} The context's Firestore for the modular API.
 */
function db(context: RulesTestContext): Firestore {
  return context.firestore() as unknown as Firestore;
}

/** @return {Firestore} Firestore as the rule owner. */
function ownerDb(): Firestore {
  return db(testEnv.authenticatedContext(OWNER));
}

/** @return {Firestore} Firestore as a signed-in non-admin who is not the owner. */
function otherDb(): Firestore {
  return db(testEnv.authenticatedContext(OTHER));
}

/** @return {Firestore} Firestore as a user with the `admin` custom claim. */
function adminDb(): Firestore {
  return db(testEnv.authenticatedContext(ADMIN, { admin: true }));
}

/**
 * @param {DocumentData} overrides Fields to change; `undefined` removes the field.
 * @return {DocumentData} A valid new rule for OWNER, with server timestamps.
 */
function newRule(overrides: DocumentData = {}): DocumentData {
  const data: DocumentData = {
    userId: OWNER,
    name: 'Florida news',
    sourceIds: ['reddit-nottheonion'],
    keywords: ['florida'],
    channels: ['email'],
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...overrides,
  };
  for (const key of Object.keys(data)) {
    if (data[key] === undefined) delete data[key];
  }
  return data;
}

/**
 * Writes documents with rules disabled.
 * @param {Record<string, DocumentData>} docs Document data by path.
 */
async function seed(docs: Record<string, DocumentData>): Promise<void> {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    for (const [docPath, data] of Object.entries(docs)) {
      await setDoc(doc(db(context), docPath), data);
    }
  });
}

/** Seeds RULE_ID owned by OWNER. */
async function seedRule(): Promise<void> {
  await seed({ [`rules/${RULE_ID}`]: newRule() });
}

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { rules: readFileSync(path.join(ROOT_DIR, 'firestore.rules'), 'utf8') },
  });
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe('events', () => {
  const EVENT = 'events/bbc-world_abc';

  beforeEach(async () => {
    await seed({ [EVENT]: { sourceId: 'bbc-world', title: 'Earthquake' } });
  });

  it('lets an admin read', async () => {
    await assertSucceeds(getDoc(doc(adminDb(), EVENT)));
    await assertSucceeds(getDocs(collection(adminDb(), 'events')));
  });

  it('denies a signed-in non-admin', async () => {
    await assertFails(getDoc(doc(otherDb(), EVENT)));
  });

  it('denies a signed-out user', async () => {
    await assertFails(getDoc(doc(db(testEnv.unauthenticatedContext()), EVENT)));
  });

  it('denies writes, admin included', async () => {
    await assertFails(setDoc(doc(adminDb(), 'events/new'), { title: 'x' }));
    await assertFails(updateDoc(doc(adminDb(), EVENT), { title: 'x' }));
    await assertFails(deleteDoc(doc(adminDb(), EVENT)));
    await assertFails(setDoc(doc(ownerDb(), 'events/new'), { title: 'x' }));
  });
});

describe('rules: create', () => {
  const create = (data: DocumentData) => setDoc(doc(ownerDb(), `rules/${RULE_ID}`), data);

  it('allows a valid rule for the owner', async () => {
    await assertSucceeds(create(newRule()));
  });

  it.each<[string, DocumentData]>([
    ['userId is another uid', { userId: OTHER }],
    ['createdAt is backdated (A5)', { createdAt: PAST }],
    ['there is an extra field', { extra: true }],
    ['a required field is missing', { active: undefined }],
    ['the name is blank', { name: '   ' }],
    ['the name has 81 chars', { name: 'a'.repeat(81) }],
    ['sourceIds is empty', { sourceIds: [] }],
    ['sourceIds has an unknown source', { sourceIds: ['cnn'] }],
    ['sourceIds has duplicates', { sourceIds: ['bbc-world', 'bbc-world'] }],
    ['keywords is empty', { keywords: [] }],
    ['channels has sms', { channels: ['email', 'sms'] }],
  ])('denies when %s', async (_label, overrides) => {
    await assertFails(create(newRule(overrides)));
  });
});

describe('rules: read', () => {
  beforeEach(seedRule);

  it('lets the owner get their own rule', async () => {
    await assertSucceeds(getDoc(doc(ownerDb(), `rules/${RULE_ID}`)));
  });

  it('denies another user', async () => {
    await assertFails(getDoc(doc(otherDb(), `rules/${RULE_ID}`)));
  });

  it('lets an admin get it', async () => {
    await assertSucceeds(getDoc(doc(adminDb(), `rules/${RULE_ID}`)));
  });

  it('allows a list query filtered to the own uid', async () => {
    const ownRules = query(collection(ownerDb(), 'rules'), where('userId', '==', OWNER));
    await assertSucceeds(getDocs(ownRules));
  });

  it('denies an unfiltered list query for a non-admin', async () => {
    await assertFails(getDocs(collection(ownerDb(), 'rules')));
  });
});

describe('rules: update', () => {
  beforeEach(seedRule);

  const ruleRef = (firestore: Firestore) => doc(firestore, `rules/${RULE_ID}`);

  it('lets the owner toggle active with a server updatedAt', async () => {
    await assertSucceeds(
      updateDoc(ruleRef(ownerDb()), { active: false, updatedAt: serverTimestamp() }),
    );
  });

  it.each<[string, DocumentData]>([
    ['userId changes', { userId: OTHER }],
    ['createdAt changes', { createdAt: PAST }],
    ['updatedAt is not server time', { updatedAt: PAST }],
  ])('denies when %s', async (_label, changes) => {
    await assertFails(
      updateDoc(ruleRef(ownerDb()), { active: false, updatedAt: serverTimestamp(), ...changes }),
    );
  });

  it('denies when updatedAt is not rewritten (keeps the old value)', async () => {
    await assertFails(updateDoc(ruleRef(ownerDb()), { active: false }));
  });

  it('denies when updatedAt is missing', async () => {
    let stored: DocumentData = {};
    await testEnv.withSecurityRulesDisabled(async (context) => {
      stored = (await getDoc(ruleRef(db(context)))).data() ?? {};
    });
    const withoutUpdatedAt: DocumentData = { ...stored, active: false };
    delete withoutUpdatedAt.updatedAt;
    await assertFails(setDoc(ruleRef(ownerDb()), withoutUpdatedAt));
  });

  it('denies another user', async () => {
    await assertFails(
      updateDoc(ruleRef(otherDb()), { active: false, updatedAt: serverTimestamp() }),
    );
  });

  it('denies an admin (no admin writes yet, C4)', async () => {
    await assertFails(
      updateDoc(ruleRef(adminDb()), { active: false, updatedAt: serverTimestamp() }),
    );
  });
});

describe('rules: delete', () => {
  beforeEach(seedRule);

  it('lets the owner delete', async () => {
    await assertSucceeds(deleteDoc(doc(ownerDb(), `rules/${RULE_ID}`)));
  });

  it('denies another user', async () => {
    await assertFails(deleteDoc(doc(otherDb(), `rules/${RULE_ID}`)));
  });

  it('denies an admin', async () => {
    await assertFails(deleteDoc(doc(adminDb(), `rules/${RULE_ID}`)));
  });
});

describe('deliveries', () => {
  const DELIVERY = `deliveries/bbc-world_abc_${RULE_ID}_email`;

  beforeEach(async () => {
    // Same fields as createDeliveries in functions/src/match/match-event.ts.
    await seed({
      [DELIVERY]: {
        eventId: 'bbc-world_abc',
        ruleId: RULE_ID,
        userId: OWNER,
        channel: 'email',
        status: 'pending',
        error: null,
        eventTitle: 'Earthquake',
        eventUrl: 'https://example.com/earthquake',
        sourceId: 'bbc-world',
        ruleName: 'Florida news',
        createdAt: PAST,
        sentAt: null,
      },
    });
  });

  it('lets an admin get and list', async () => {
    await assertSucceeds(getDoc(doc(adminDb(), DELIVERY)));
    await assertSucceeds(getDocs(collection(adminDb(), 'deliveries')));
  });

  it('lets the owner get their own delivery', async () => {
    await assertSucceeds(getDoc(doc(ownerDb(), DELIVERY)));
  });

  it('allows an owner list query filtered to the own uid', async () => {
    const own = query(collection(ownerDb(), 'deliveries'), where('userId', '==', OWNER));
    await assertSucceeds(getDocs(own));
  });

  it('denies another user', async () => {
    await assertFails(getDoc(doc(otherDb(), DELIVERY)));
  });

  it('denies an unfiltered list query for a non-admin', async () => {
    await assertFails(getDocs(collection(ownerDb(), 'deliveries')));
  });

  it('denies a signed-out user', async () => {
    await assertFails(getDoc(doc(db(testEnv.unauthenticatedContext()), DELIVERY)));
  });

  const writers: [string, () => Firestore][] = [
    ['the owner', ownerDb],
    ['an admin', adminDb],
  ];

  it.each(writers)('denies writes by %s', async (_label, firestore) => {
    await assertFails(setDoc(doc(firestore(), 'deliveries/new'), { userId: OWNER }));
    await assertFails(updateDoc(doc(firestore(), DELIVERY), { status: 'pending' }));
    await assertFails(deleteDoc(doc(firestore(), DELIVERY)));
  });
});

describe('catch-all', () => {
  beforeEach(async () => {
    await seed({
      'sources/bbc-world': { name: 'BBC World' },
      'users/alice': { userId: OWNER },
    });
  });

  it.each(['sources/bbc-world', 'users/alice'])(
    'denies a signed-in user reading or writing %s',
    async (docPath) => {
      await assertFails(getDoc(doc(ownerDb(), docPath)));
      await assertFails(setDoc(doc(ownerDb(), docPath), { userId: OWNER }));
    },
  );
});
