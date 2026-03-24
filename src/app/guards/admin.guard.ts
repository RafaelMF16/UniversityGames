import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStateService } from '../services/auth-state.service';

export const adminGuard: CanActivateFn = async () => {
  const authState = inject(AuthStateService);
  const router = inject(Router);

  await authState.ensureInitialized();

  return authState.canManageUsers() ? true : router.createUrlTree(['/dashboard']);
};
