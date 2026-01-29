import { HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export function authInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
){
  const authToken = inject(AuthService).token();

  console.log({authToken})

  const newReq= req.clone({
    headers: req.headers.set('Authorization', `Bearer ${authToken}`)
  });
  return next(newReq);
}
