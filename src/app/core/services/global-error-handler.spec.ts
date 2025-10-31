import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { GlobalErrorHandler } from './global-error-handler';
import { LoggingService } from './logging.service';
import { NgZone } from '@angular/core';

describe('GlobalErrorHandler', () => {
  let errorHandler: GlobalErrorHandler;
  let loggingService: LoggingService;
  let router: Router;
  let ngZone: NgZone;

  // Mock services
  const routerMock = {
    navigate: jasmine.createSpy('navigate')
  };

  const loggingServiceMock = {
    logError: jasmine.createSpy('logError')
  };

  const ngZoneMock = {
    run: jasmine.createSpy('run').and.callFake((fn: Function) => fn())
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GlobalErrorHandler,
        { provide: Router, useValue: routerMock },
        { provide: LoggingService, useValue: loggingServiceMock },
        { provide: NgZone, useValue: ngZoneMock }
      ]
    });

    errorHandler = TestBed.inject(GlobalErrorHandler);
    loggingService = TestBed.inject(LoggingService);
    router = TestBed.inject(Router);
    ngZone = TestBed.inject(NgZone);
  });

  beforeEach(() => {
    routerMock.navigate.calls.reset();
    loggingServiceMock.logError.calls.reset();
    ngZoneMock.run.calls.reset();
  });

  it('should be created', () => {
    expect(errorHandler).toBeTruthy();
  });

  it('should log error and navigate to error page', () => {
    const testError = new Error('Test error');
    
    errorHandler.handleError(testError);

    expect(loggingServiceMock.logError).toHaveBeenCalledWith(
      testError,
      jasmine.objectContaining({
        timestamp: jasmine.any(String),
        additionalData: jasmine.objectContaining({
          url: jasmine.any(String),
          userAgent: jasmine.any(String)
        })
      })
    );

    expect(ngZoneMock.run).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(
      ['/error/runtime'],
      jasmine.objectContaining({
        queryParams: jasmine.objectContaining({
          errorId: jasmine.any(String),
          timestamp: jasmine.any(String)
        })
      })
    );
  });

  it('should generate unique error IDs', () => {
    const errorIds = new Set();
    const testError = new Error('Test error');

    // Generate multiple error IDs
    for (let i = 0; i < 100; i++) {
      errorHandler.handleError(testError);
      const errorId = routerMock.navigate.calls.mostRecent().args[1].queryParams.errorId;
      errorIds.add(errorId);
    }

    // All error IDs should be unique
    expect(errorIds.size).toBe(100);
  });

  it('should extract component stack if available', () => {
    const errorWithStack = new Error('Test error');
    (errorWithStack as any).ngDebugContext = {
      componentStack: 'TestComponent -> ParentComponent'
    };

    errorHandler.handleError(errorWithStack);

    expect(loggingServiceMock.logError).toHaveBeenCalledWith(
      errorWithStack,
      jasmine.objectContaining({
        componentStack: 'TestComponent -> ParentComponent'
      })
    );
  });
});