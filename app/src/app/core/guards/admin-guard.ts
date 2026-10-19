import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

/** UX only: hides admin pages from non-admins. Firestore rules do the real check. */
export const adminGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return (await auth.checkAdmin()) || router.createUrlTree(['/alerts']);
};
