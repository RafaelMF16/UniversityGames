import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStateService } from '../services/auth-state.service';

export const loginGuard: CanActivateFn = async () => {
  const authState = inject(AuthStateService);
  const router = inject(Router);

  await authState.ensureInitialized();

  return authState.canAccessShell() ? router.createUrlTree(['/dashboard']) : true;
};
