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
        additionalData: {}
      };
      
      // Only add browser-specific information when running in browser
      if (isPlatformBrowser(this.platformId)) {
        try {
          errorContext.additionalData = {
            url: window?.location?.href || 'unknown',
            userAgent: navigator?.userAgent || 'unknown'
          };
        } catch (e) {
          // Swallow any errors accessing browser APIs
        }
      } else {
        errorContext.additionalData = {
          environment: 'server',
          nodeVersion: process?.version || 'unknown'
        };
      }    // Log the error with full context. Guard against errors inside the logging
    // implementation so we don't cause a logging -> error -> logging cycle.
    try {
      this.loggingService.logError(error, errorContext);
    } catch (e) {
      try { console && console.error && console.error('[GlobalErrorHandler] loggingService.logError failed', e); } catch {}
    }

    // Only log the error in browser environment
    if (isPlatformBrowser(this.platformId)) {
      try {
        this.ngZone.run(() => {
          console.error('[GlobalErrorHandler] Error occurred:', {
            error,
            errorId: this.generateErrorId(),
            timestamp: errorContext.timestamp
          });
        });
      } catch (e) {
        try { console && console.error && console.error('[GlobalErrorHandler] error handling failed', e); } catch {}
      }
    }
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