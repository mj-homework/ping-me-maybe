import { Injectable, inject } from '@angular/core';
import {
  QueryDocumentSnapshot,
  Timestamp,
  Unsubscribe,
  addDoc,
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { NewRule, Rule, RuleChanges } from '../models/rule';
import { FIREBASE_AUTH, FIRESTORE } from './firebase';

type RuleDoc = Omit<Rule, 'id' | 'createdAt' | 'updatedAt'> & {
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

/** CRUD on `rules`. Rules allow each user only their own documents. */
@Injectable({ providedIn: 'root' })
export class RulesService {
  private readonly db = inject(FIRESTORE);
  private readonly auth = inject(FIREBASE_AUTH);

  /** Live list of the user's rules, newest first. Returns the unsubscribe function. */
  watchMine(uid: string, next: (rules: Rule[]) => void, error: (err: Error) => void): Unsubscribe {
    const q = query(
      collection(this.db, 'rules'),
      where('userId', '==', uid),
      orderBy('createdAt', 'desc'),
    );
    return onSnapshot(q, (snapshot) => next(snapshot.docs.map(toRule)), error);
  }

  /** Admins only (rules): live list of all users' newest rules. Returns the unsubscribe function. */
  watchAll(max: number, next: (rules: Rule[]) => void, error: (err: Error) => void): Unsubscribe {
    const q = query(collection(this.db, 'rules'), orderBy('createdAt', 'desc'), limit(max));
    return onSnapshot(q, (snapshot) => next(snapshot.docs.map(toRule)), error);
  }

  async create(rule: NewRule): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Not signed in.');
    await addDoc(collection(this.db, 'rules'), {
      userId: user.uid,
      name: rule.name.trim(),
      sourceIds: rule.sourceIds,
      keywords: normalizeKeywords(rule.keywords),
      channels: rule.channels,
      active: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  /** Owner edit. `userId`, `createdAt` (A5), `channels` and `active` are not sent, so they stay. */
  async update(id: string, changes: RuleChanges): Promise<void> {
    await updateDoc(doc(this.db, 'rules', id), {
      name: changes.name.trim(),
      sourceIds: changes.sourceIds,
      keywords: normalizeKeywords(changes.keywords),
      updatedAt: serverTimestamp(),
    });
  }

  async setActive(id: string, active: boolean): Promise<void> {
    await updateDoc(doc(this.db, 'rules', id), { active, updatedAt: serverTimestamp() });
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(this.db, 'rules', id));
  }
}

/** Trim, lower-case, drop empties and duplicates (design.md §1). */
export function normalizeKeywords(keywords: readonly string[]): string[] {
  const cleaned = keywords.map((k) => k.trim().toLowerCase()).filter((k) => k.length > 0);
  return [...new Set(cleaned)];
}

function toRule(snap: QueryDocumentSnapshot): Rule {
  // A pending local write has no server time yet; 'estimate' fills in the local clock.
  const data = snap.data({ serverTimestamps: 'estimate' }) as RuleDoc;
  return {
    ...data,
    id: snap.id,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  };
}
