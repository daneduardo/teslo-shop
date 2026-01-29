import { inject } from '@angular/core';
import { CanMatchFn, Route, Router, UrlSegment } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';

export const notAuthenticatedGuard: CanMatchFn = async (
  route: Route,
  segments: UrlSegment[]
) => {
  console.log('NotAuthenticatedGuard - canMatch');
  const router = inject(Router);
  const authService = inject(AuthService);

  const isAuthenticated = await firstValueFrom(authService.checkAuthStatus());
  if(isAuthenticated){
    await router.navigateByUrl('/');
    return false;
  }

  return true;
};
