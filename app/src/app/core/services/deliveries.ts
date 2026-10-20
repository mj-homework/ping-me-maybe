import { Injectable, inject } from '@angular/core';
import {
  Timestamp,
  Unsubscribe,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore';
import { Delivery } from '../models/delivery';
import { FIRESTORE } from './firebase';

/** Shape written by `createDeliveries` / `processDelivery` in functions/ (design.md §1). */
export type DeliveryDoc = Omit<Delivery, 'id' | 'createdAt' | 'sentAt'> & {
  createdAt: Timestamp;
  sentAt: Timestamp | null;
};

/** Reads `deliveries`. Rules allow all of them only with the `admin` claim. */
@Injectable({ providedIn: 'root' })
export class DeliveriesService {
  private readonly db = inject(FIRESTORE);

  /** Live list of the newest deliveries. Returns the unsubscribe function. */
  watchLatest(
    max: number,
    next: (deliveries: Delivery[]) => void,
    error: (err: Error) => void,
  ): Unsubscribe {
    const q = query(collection(this.db, 'deliveries'), orderBy('createdAt', 'desc'), limit(max));
    return onSnapshot(
      q,
      (snapshot) =>
        next(snapshot.docs.map((snap) => toDelivery(snap.id, snap.data() as DeliveryDoc))),
      error,
    );
  }
}

/** Only Cloud Functions write deliveries, so the shape is trusted here. */
export function toDelivery(id: string, data: DeliveryDoc): Delivery {
  return {
    ...data,
    id,
    error: data.error ?? null,
    createdAt: data.createdAt.toDate(),
    sentAt: data.sentAt?.toDate() ?? null,
  };
}
