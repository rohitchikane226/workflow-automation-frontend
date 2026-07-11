// jwt.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const JwtInterceptor: HttpInterceptorFn = (req, next) => {

  const router = inject(Router); // 🔥 inject router

  const token = localStorage.getItem('token');

  let authReq = req;

  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error) => {

      // 🔥 MAIN LOGIC
      if (error.status === 403) {

        // remove token
        localStorage.removeItem('token');

        // redirect to login
        router.navigate(['/auth']);
      }

      return throwError(() => error);
    })
  );
};