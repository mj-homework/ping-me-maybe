import { Injectable, computed, inject, signal } from '@angular/core';
import {
  User,
  createUserWithEmailAndPassword,
  getIdTokenResult,
  onIdTokenChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { FIREBASE_AUTH } from './firebase';

interface AuthState {
  user: User | null;
  admin: boolean;
}

/** Email/password sign-in and the `admin` claim. The claim is for UX only; rules enforce it. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly auth = inject(FIREBASE_AUTH);
  /** `undefined` until Firebase has restored the session. */
  private readonly state = signal<AuthState | undefined>(undefined);

  readonly ready = computed(() => this.state() !== undefined);
  readonly user = computed(() => this.state()?.user ?? null);
  readonly isAdmin = computed(() => this.state()?.admin ?? false);

  constructor() {
    // Fires on sign-in, sign-out and token refresh, so a new claim shows up after re-login.
    onIdTokenChanged(this.auth, async (user) => {
      const admin = user ? await hasAdminClaim(user) : false;
      // Ignore a late result for a user who has already signed out.
      if (this.auth.currentUser === user) this.state.set({ user, admin });
    });
  }

  /** For guards: waits for the restored session, then reads the claim from the ID token. */
  async checkAdmin(): Promise<boolean> {
    await this.auth.authStateReady();
    const user = this.auth.currentUser;
    return user ? hasAdminClaim(user) : false;
  }

  async signIn(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email, password);
  }

  async signUp(email: string, password: string): Promise<void> {
    await createUserWithEmailAndPassword(this.auth, email, password);
  }

  signOut(): Promise<void> {
    return signOut(this.auth);
  }
}

async function hasAdminClaim(user: User): Promise<boolean> {
  const { claims } = await getIdTokenResult(user);
  return claims['admin'] === true;
}
