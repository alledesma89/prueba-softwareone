import { ApplicationConfig, isDevMode, importProvidersFrom, ErrorHandler } from '@angular/core';
import { provideServiceWorker } from '@angular/service-worker';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';

import { ErrorInterceptor } from './core/interceptors/error.interceptor';
import { AuthInterceptorProvider } from './core/interceptors/auth.interceptor';
import { GlobalErrorHandler } from './core/services/global-error-handler';

export const appConfig: ApplicationConfig = {
  providers: [
    // Use Router configuration from AppRoutingModule so RouterModule.forRoot(..., { preloadingStrategy: PreloadAllModules }) is applied
    importProvidersFrom(AppRoutingModule),
  // Provide HttpClient for services used during prerender/server rendering
  // Use withFetch() for better SSR compatibility
  provideHttpClient(withFetch()),
    // Register HTTP interceptors implemented in core/interceptors

    ErrorInterceptor.provider,
    AuthInterceptorProvider,
    // Provide the application's global ErrorHandler implementation
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ]
};
