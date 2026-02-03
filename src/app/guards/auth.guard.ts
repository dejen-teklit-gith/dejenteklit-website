import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Checks if a token exists in your AuthService
  if (auth.getToken()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
