import { Injectable, inject } from '@angular/core';
import {
  QueryDocumentSnapshot,
  Timestamp,
  Unsubscribe,
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { NewRule, Rule } from '../models/rule';
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
