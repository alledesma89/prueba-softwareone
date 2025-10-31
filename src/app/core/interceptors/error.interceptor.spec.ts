import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ErrorInterceptor } from './error.interceptor';

describe('ErrorInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let router: Router;

  // Mock Router
  const routerMock = {
    navigate: jasmine.createSpy('navigate')
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: ErrorInterceptor,
          multi: true,
        },
        {
          provide: Router,
          useValue: routerMock,
        },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
    routerMock.navigate.calls.reset();
  });

  it('should handle 401 Unauthorized error', () => {
    const errorSpy = spyOn(console, 'error');
    
    httpClient.get('/api/test').subscribe({
      error: (error) => {
        expect(error.status).toBe(401);
        expect(error.message).toBe('Your session has expired. Please log in again.');
        expect(routerMock.navigate).toHaveBeenCalledWith(
          ['/error/401'],
          jasmine.any(Object)
        );
        expect(errorSpy).toHaveBeenCalled();
      },
    });

    const req = httpMock.expectOne('/api/test');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
  });

  it('should handle 500 Internal Server Error', () => {
    const errorSpy = spyOn(console, 'error');

    httpClient.get('/api/test').subscribe({
      error: (error) => {
        expect(error.status).toBe(500);
        expect(error.message).toBe(
          'An internal server error occurred. Please try again later.'
        );
        expect(routerMock.navigate).toHaveBeenCalledWith(
          ['/error/500'],
          jasmine.any(Object)
        );
        expect(errorSpy).toHaveBeenCalled();
      },
    });

    const req = httpMock.expectOne('/api/test');
    req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
  });

  it('should handle 503 Service Unavailable error', () => {
    const errorSpy = spyOn(console, 'error');

    httpClient.get('/api/test').subscribe({
      error: (error) => {
        expect(error.status).toBe(503);
        expect(error.message).toBe(
          'The service is temporarily unavailable. Please try again later.'
        );
        expect(routerMock.navigate).toHaveBeenCalledWith(
          ['/error/500'],
          jasmine.any(Object)
        );
        expect(errorSpy).toHaveBeenCalled();
      },
    });

    const req = httpMock.expectOne('/api/test');
    req.flush('Service Unavailable', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  });

  it('should include timestamp and path in error details', () => {
    httpClient.get('/api/test').subscribe({
      error: (error) => {
        expect(error.timestamp).toBeDefined();
        expect(new Date(error.timestamp).getTime()).not.toBeNaN();
        expect(error.path).toBe('/api/test');
      },
    });

    const req = httpMock.expectOne('/api/test');
    req.flush('Error', { status: 500, statusText: 'Internal Server Error' });
  });

  it('should handle unknown error codes', () => {
    httpClient.get('/api/test').subscribe({
      error: (error) => {
        expect(error.message).toBe(
          'An unexpected error occurred. Please try again later.'
        );
        expect(routerMock.navigate).not.toHaveBeenCalled();
      },
    });

    const req = httpMock.expectOne('/api/test');
    req.flush('Unknown Error', { status: 418, statusText: 'I\'m a teapot' });
  });
});