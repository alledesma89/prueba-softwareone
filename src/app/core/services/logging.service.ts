import { Injectable, Inject, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Simple LoggingService used across the app.
 * - logError(error, context)
 * - logEvent(event, data)
 * - logWarning(message, context)
 *
 * This implementation writes to console and simulates sending payloads to a remote
 * logging endpoint. In a production app you'd replace the simulation with an actual
 * HTTP call to your logging/telemetry backend.
 */
@Injectable({
  providedIn: 'root'
})
export class LoggingService {
  // Simulated endpoint (not actually called in this implementation, used for log messages)
  private readonly LOG_ENDPOINT = 'https://example.com/api/logs';

  constructor(
    @Optional() private http?: HttpClient,
    @Optional() @Inject(PLATFORM_ID) private platformId?: Object
  ) {}

  /**
   * Log an error. Accepts any error shape and optional context information.
   */
  public logError(error: unknown, context?: Record<string, any>): void {
    try {
      const payload = this.buildPayload('error', { error, context });

      // Only write to browser console when in browser. On server, write to
      // process.stderr if available to avoid using decorated console implementations
      // that might throw.
      const browser = isPlatformBrowser(this.platformId as any);
      try {
        if (browser) {
          console && console.error && console.error('[LoggingService] ERROR', payload);
        } else if (typeof process !== 'undefined' && process.stderr && process.stderr.write) {
          try { process.stderr.write(`[LoggingService] ERROR ${JSON.stringify(payload)}\n`); } catch {}
        }
      } catch (e) {
        /* swallow console/process errors to avoid recursion */
      }

      // Only simulate network send in browser environment (avoid side effects during SSR)
      try {
        if (browser) {
          this.simulateSend(payload);
        }
      } catch (e) {
        /* swallow send errors */
      }
    } catch (e) {
      // Last-resort guard: make sure logging itself never throws
      try {
        const browser = isPlatformBrowser(this.platformId as any);
        if (browser) {
          console && console.error && console.error('[LoggingService] fatal logging failure', e);
        } else if (typeof process !== 'undefined' && process.stderr && process.stderr.write) {
          try { process.stderr.write(`[LoggingService] fatal logging failure ${String(e)}\n`); } catch {}
        }
      } catch {}
    }
  }

  /**
   * Log a named event with optional metadata
   */
  public logEvent(event: string, data?: any): void {
    try {
      const payload = this.buildPayload('event', { event, data });
      const browser = isPlatformBrowser(this.platformId as any);
      try {
        if (browser) {
          console && console.log && console.log('[LoggingService] EVENT', payload);
        } else if (typeof process !== 'undefined' && process.stdout && process.stdout.write) {
          try { process.stdout.write(`[LoggingService] EVENT ${JSON.stringify(payload)}\n`); } catch {}
        }
      } catch {}
      try { if (browser) { this.simulateSend(payload); } } catch {}
    } catch (e) {
      try { if (isPlatformBrowser(this.platformId as any)) { console && console.error && console.error('[LoggingService] logEvent failed', e); } } catch {}
    }
  }

  /**
   * Log a warning message with optional context
   */
  public logWarning(message: string, context?: Record<string, any>): void {
    try {
      const payload = this.buildPayload('warn', { message, context });
      const browser = isPlatformBrowser(this.platformId as any);
      try {
        if (browser) {
          console && console.warn && console.warn('[LoggingService] WARNING', payload);
        } else if (typeof process !== 'undefined' && process.stdout && process.stdout.write) {
          try { process.stdout.write(`[LoggingService] WARNING ${JSON.stringify(payload)}\n`); } catch {}
        }
      } catch {}
      try { if (browser) { this.simulateSend(payload); } } catch {}
    } catch (e) {
      try { if (isPlatformBrowser(this.platformId as any)) { console && console.error && console.error('[LoggingService] logWarning failed', e); } } catch {}
    }
  }

  /**
   * Build a consistent payload for logging
   */
  private buildPayload(level: 'error' | 'warn' | 'event', body: any) {
    const browser = isPlatformBrowser(this.platformId as any);
    const userAgent = browser
      ? (typeof navigator !== 'undefined' ? navigator.userAgent : 'browser')
      : (typeof process !== 'undefined' ? `node/${process.version}` : 'server');

    return {
      level,
      body,
      timestamp: new Date().toISOString(),
      userAgent
    };
  }

  /**
   * Simulates sending the log payload to a remote endpoint.
   * If HttpClient was injected this could perform a real POST. For now we just
   * schedule a console.info to indicate the simulated network activity.
   */
  private simulateSend(payload: any): void {
    // If HttpClient is available, you can uncomment the POST call below to send logs.
    // this.http?.post(this.LOG_ENDPOINT, payload).subscribe({ next: () => {}, error: () => {} });

    // Only simulate network activity in browser. During SSR/prerender we avoid
    // side effects like setTimeout/network calls.
    try {
      if (isPlatformBrowser(this.platformId as any)) {
        setTimeout(() => {
          try {
            console && console.info && console.info('[LoggingService] simulated send to', this.LOG_ENDPOINT, 'payload:', payload);
          } catch (e) {
            // swallow
          }
        }, 200);
      }
    } catch (e) {
      try { if (isPlatformBrowser(this.platformId as any)) { console && console.error && console.error('[LoggingService] simulateSend failed', e); } } catch {}
    }
  }
}
