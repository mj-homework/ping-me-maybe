import { Injectable, inject } from '@angular/core';
import {
  QueryDocumentSnapshot,
  Timestamp,
  Unsubscribe,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore';
import { EventListItem } from '../models/event';
import { FIRESTORE } from './firebase';

/** Shape written by `pollAllSources` in functions/ (design.md §1). */
interface EventDoc {
  sourceId: string;
  title: string;
  url: string;
  publishedAt: Timestamp;
}

/** Reads `events`. Rules allow this only with the `admin` claim. */
@Injectable({ providedIn: 'root' })
export class EventsService {
  private readonly db = inject(FIRESTORE);

  /**
   * Live list of the newest events by `publishedAt`. One poll gives all its events nearly the
   * same `ingestedAt`, so that order would look random. The parser drops items without a valid
   * date, so `orderBy` leaves no event out. Returns the unsubscribe function.
   */
  watchLatest(
    max: number,
    next: (events: EventListItem[]) => void,
    error: (err: Error) => void,
  ): Unsubscribe {
    const q = query(collection(this.db, 'events'), orderBy('publishedAt', 'desc'), limit(max));
    return onSnapshot(q, (snapshot) => next(snapshot.docs.map(toListItem)), error);
  }
}

function toListItem(snap: QueryDocumentSnapshot): EventListItem {
  // Only Cloud Functions write events, so the shape is trusted here.
  const data = snap.data() as EventDoc;
  return {
    id: snap.id,
    sourceId: data.sourceId,
    title: data.title,
    url: data.url,
    publishedAt: data.publishedAt.toDate(),
  };
}
