import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

interface AuthResponse {
  token: string;
  // You might include user info here as well
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'authToken';
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());

  // Replace with your actual authentication API endpoint
  private readonly AUTH_API_URL = 'http://localhost:3000/login'; // Example for json-server

  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) { }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  login(credentials: { username: string, password: string }): Observable<AuthResponse> {
    // In a real application, you would send credentials to your backend
    // and expect a token in return.
    // For this example, we're simulating a successful login.
    if (credentials.username === 'user' && credentials.password === 'password') {
      const mockToken = 'mock-jwt-token-12345';
      return of({ token: mockToken }).pipe(
        tap(response => {
          this.setToken(response.token);
          this.isLoggedInSubject.next(true);
        }),
        catchError(this.handleError)
      );
    } else {
      return new Observable<AuthResponse>(observer => {
        observer.error({ status: 401, message: 'Invalid credentials' });
      }).pipe(catchError(this.handleError));
    }
    // Uncomment the following for a real API call:
    /*
    return this.http.post<AuthResponse>(this.AUTH_API_URL, credentials).pipe(
      tap(response => {
        this.setToken(response.token);
        this.isLoggedInSubject.next(true);
      }),
      catchError(this.handleError)
    );
    */
  }

  logout(): void {
    this.removeToken();
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  private handleError(error: any): Observable<never> {
    console.error('AuthService error:', error);
    // Depending on the error, you might want to re-throw a more specific error
    return new Observable<never>(observer => {
      observer.error(error);
    });
  }
}
