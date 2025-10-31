import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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

  constructor(private http?: HttpClient) {}

  /**
   * Log an error. Accepts any error shape and optional context information.
   */
  public logError(error: unknown, context?: Record<string, any>): void {
    const payload = this.buildPayload('error', { error, context });

    // Console output
    console.error('[LoggingService] ERROR', payload);

    // Simulate sending to server (non-blocking)
    this.simulateSend(payload);
  }

  /**
   * Log a named event with optional metadata
   */
  public logEvent(event: string, data?: any): void {
    const payload = this.buildPayload('event', { event, data });

    console.log('[LoggingService] EVENT', payload);
    this.simulateSend(payload);
  }

  /**
   * Log a warning message with optional context
   */
  public logWarning(message: string, context?: Record<string, any>): void {
    const payload = this.buildPayload('warn', { message, context });

    console.warn('[LoggingService] WARNING', payload);
    this.simulateSend(payload);
  }

  /**
   * Build a consistent payload for logging
   */
  private buildPayload(level: 'error' | 'warn' | 'event', body: any) {
    return {
      level,
      body,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server'
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

    // Simulate asynchronous network send
    setTimeout(() => {
      console.info('[LoggingService] simulated send to', this.LOG_ENDPOINT, 'payload:', payload);
    }, 200);
  }
}
