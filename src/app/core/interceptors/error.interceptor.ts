import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

interface ErrorRoute {
  statusCode: number;
  route: string;
}

import { LoggingService } from '../services/logging.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  // Map of status codes to their corresponding error routes
  private readonly errorRoutes: ErrorRoute[] = [
    { statusCode: 401, route: '/error/401' },
    { statusCode: 403, route: '/error/403' },
    { statusCode: 404, route: '/error/404' },
    { statusCode: 500, route: '/error/500' },
    { statusCode: 503, route: '/error/500' }, // Service Unavailable redirects to 500 page
  ];

  constructor(private router: Router, private loggingService: LoggingService) {}

  public static readonly provider = {
    provide: HTTP_INTERCEPTORS,
    useClass: ErrorInterceptor,
    multi: true,
  };

  public intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Log the error (in a real app, you might want to use a logging service)
        this.logError(error);

        // Handle navigation based on error status
        this.handleErrorNavigation(error);

        // Create a user-friendly error message
        const userMessage = this.createUserFriendlyMessage(error);

        // Return the error with the user-friendly message
        return throwError(() => ({
          status: error.status,
          message: userMessage,
          timestamp: new Date().toISOString(),
          path: request.url,
          originalError: error
        }));
      })
    );
  }

  /**
   * Logs the error with relevant information
   */
  private logError(error: HttpErrorResponse): void {
    this.loggingService.logError(error, {
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      message: error.message,
    });
  }

  /**
   * Handles navigation based on error status code
   */
  private handleErrorNavigation(error: HttpErrorResponse): void {
    // Find matching error route
    const errorRoute = this.errorRoutes.find(
      route => route.statusCode === error.status
    );

    if (errorRoute) {
      // Navigate to the appropriate error page
      this.router.navigate([errorRoute.route], {
        queryParams: {
          status: error.status,
          message: this.createUserFriendlyMessage(error),
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  /**
   * Creates a user-friendly error message based on the HTTP error
   */
  private createUserFriendlyMessage(error: HttpErrorResponse): string {
    switch (error.status) {
      case 401:
        return 'Your session has expired. Please log in again.';
      case 403:
        return 'You do not have permission to access this resource.';
      case 404:
        return 'The requested resource was not found.';
      case 500:
        return 'An internal server error occurred. Please try again later.';
      case 503:
        return 'The service is temporarily unavailable. Please try again later.';
      default:
        return 'An unexpected error occurred. Please try again later.';
    }
  }
}