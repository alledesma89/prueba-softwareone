import { ErrorHandler, Injectable, NgZone, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LoggingService } from './logging.service';
import { Router } from '@angular/router';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(
    private loggingService: LoggingService,
    private router: Router,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  public handleError(error: Error): void {
    // Extract component stack if available (for errors in components)
    const componentStack = this.extractComponentStack(error);

    // Get additional context about the error
    const errorContext = {
      timestamp: new Date().toISOString(),
      componentStack,
      additionalData: {
        url: isPlatformBrowser(this.platformId) ? window.location.href : 'N/A',
        userAgent: isPlatformBrowser(this.platformId) ? navigator.userAgent : 'N/A',
        // Add any other relevant context
      }
    };

    // Log the error with full context
    this.loggingService.logError(error, errorContext);

    // Navigate to error page (inside NgZone to trigger change detection)
    this.ngZone.run(() => {
      this.router.navigate(['/error/runtime'], {
        queryParams: {
          errorId: this.generateErrorId(),
          timestamp: errorContext.timestamp
        }
      });
    });
  }

  /**
   * Extracts the component stack from Angular errors if available
   */
  private extractComponentStack(error: Error): string | undefined {
    if (error instanceof Error) {
      const componentStack = (error as any)?.ngDebugContext?.componentStack;
      return componentStack ? String(componentStack) : undefined;
    }
    return undefined;
  }

  /**
   * Generates a unique error ID for tracking
   */
  private generateErrorId(): string {
    return `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}