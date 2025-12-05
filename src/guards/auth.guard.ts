import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  // Check if token exists in storage even if signal not set yet (reload case)
  if (auth.getToken()) {
    auth.isAuthenticated.set(true);
    return true;
  }

  return router.createUrlTree(['/login']);
};
