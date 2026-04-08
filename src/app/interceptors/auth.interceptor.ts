import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthStateService } from '../services/auth-state.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authState = inject(AuthStateService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isAuthEndpoint = req.url.includes('/auth/login') || req.url.includes('/auth/register-visitor') || req.url.includes('/auth/me');

      if (error.status === 401 && !isAuthEndpoint && authState.isAuthenticated()) {
        authState.clearSession();
        void router.navigateByUrl('/login');
      }

      return throwError(() => error);
    })
  );
};
