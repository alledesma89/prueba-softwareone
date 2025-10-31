import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';

describe('AuthInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthInterceptor,
          multi: true,
        },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add auth header to protected URLs', () => {
    httpClient.get('/api/protected-resource').subscribe();

    const httpRequest = httpMock.expectOne('/api/protected-resource');
    expect(httpRequest.request.headers.has('Authorization')).toBeTrue();
    expect(httpRequest.request.headers.get('Authorization')).toBe(
      'Bearer simulated-jwt-token'
    );
  });

  it('should not add auth header to excluded URLs', () => {
    httpClient.post('/api/auth/login', {}).subscribe();

    const httpRequest = httpMock.expectOne('/api/auth/login');
    expect(httpRequest.request.headers.has('Authorization')).toBeFalse();
  });

  it('should handle 401 unauthorized error', () => {
    const errorSpy = spyOn(console, 'error');

    httpClient.get('/api/protected-resource').subscribe({
      error: (error) => {
        expect(error.status).toBe(401);
        expect(errorSpy).toHaveBeenCalled();
      },
    });

    const httpRequest = httpMock.expectOne('/api/protected-resource');
    httpRequest.flush('Unauthorized', {
      status: 401,
      statusText: 'Unauthorized',
    });
  });

  it('should handle 403 forbidden error', () => {
    const errorSpy = spyOn(console, 'error');

    httpClient.get('/api/protected-resource').subscribe({
      error: (error) => {
        expect(error.status).toBe(403);
        expect(errorSpy).toHaveBeenCalled();
      },
    });

    const httpRequest = httpMock.expectOne('/api/protected-resource');
    httpRequest.flush('Forbidden', {
      status: 403,
      statusText: 'Forbidden',
    });
  });

  it('should pass through other errors unchanged', () => {
    httpClient.get('/api/protected-resource').subscribe({
      error: (error) => {
        expect(error.status).toBe(500);
      },
    });

    const httpRequest = httpMock.expectOne('/api/protected-resource');
    httpRequest.flush('Server Error', {
      status: 500,
      statusText: 'Internal Server Error',
    });
  });
});