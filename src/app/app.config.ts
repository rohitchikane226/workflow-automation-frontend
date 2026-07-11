import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { withInterceptors } from '@angular/common/http';
import { JwtInterceptor } from './interceptors/jwt-interceptor';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(),
     provideHttpClient(
      withInterceptors([JwtInterceptor])),
    provideRouter(routes),
    provideAnimations()
  ]
};
