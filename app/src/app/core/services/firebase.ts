import { InjectionToken, inject, isDevMode } from '@angular/core';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { Auth, connectAuthEmulator, getAuth } from 'firebase/auth';
import { Firestore, connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { Functions, connectFunctionsEmulator, getFunctions } from 'firebase/functions';

/**
 * Same ID as `.firebaserc`. A `demo-` project exists only in the emulators, so the
 * API key is a placeholder, not a secret.
 */
const FIREBASE_OPTIONS = { projectId: 'demo-ping-me-maybe', apiKey: 'demo-api-key' };

/** Emulator ports from `firebase.json`. */
const AUTH_EMULATOR_URL = 'http://127.0.0.1:9099';
const FIRESTORE_EMULATOR = { host: '127.0.0.1', port: 8080 };
const FUNCTIONS_EMULATOR = { host: '127.0.0.1', port: 5001 };

/** functions/ sets no region, so the callables run in the default one. */
const FUNCTIONS_REGION = 'us-central1';

export const FIREBASE_APP = new InjectionToken<FirebaseApp>('FIREBASE_APP', {
  providedIn: 'root',
  factory: () => initializeApp(FIREBASE_OPTIONS),
});

export const FIREBASE_AUTH = new InjectionToken<Auth>('FIREBASE_AUTH', {
  providedIn: 'root',
  factory: () => {
    const auth = getAuth(inject(FIREBASE_APP));
    if (isDevMode()) connectAuthEmulator(auth, AUTH_EMULATOR_URL, { disableWarnings: true });
    return auth;
  },
});

export const FIRESTORE = new InjectionToken<Firestore>('FIRESTORE', {
  providedIn: 'root',
  factory: () => {
    const db = getFirestore(inject(FIREBASE_APP));
    if (isDevMode()) connectFirestoreEmulator(db, FIRESTORE_EMULATOR.host, FIRESTORE_EMULATOR.port);
    return db;
  },
});

export const FIREBASE_FUNCTIONS = new InjectionToken<Functions>('FIREBASE_FUNCTIONS', {
  providedIn: 'root',
  factory: () => {
    const functions = getFunctions(inject(FIREBASE_APP), FUNCTIONS_REGION);
    if (isDevMode()) {
      connectFunctionsEmulator(functions, FUNCTIONS_EMULATOR.host, FUNCTIONS_EMULATOR.port);
    }
    return functions;
  },
});
