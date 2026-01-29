import { computed, inject, Injectable, signal } from '@angular/core';
import { User } from '@auth/interfaces/user.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.development';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { AuthResponse } from '@auth/interfaces/auth-response.interface';
import { rxResource } from '@angular/core/rxjs-interop';

type AuthStatus = 'checking' | 'authenticated' | 'not-authenticated';
const baseUrl = environment.baseUrl;

@Injectable({ providedIn: 'root' })

export class AuthService {

  private _authstatus = signal<AuthStatus>('checking');
  private _user = signal<User | null>(null);
  private _token = signal<string | null>(localStorage.getItem('token'));

  private http = inject(HttpClient);

  checkStatusResource = rxResource({
    stream: () => this.checkAuthStatus(),
  });
  // Computed Properties
  authStatus = computed<AuthStatus>(() => {
    if (this._authstatus() === 'checking') return 'checking';

    if (this._user()) {
      return 'authenticated';
    }
    return 'not-authenticated';
  });
  user = computed<User | null>(() => this._user());
  token = computed<string | null>(() => this._token());
  isAdmin = computed<boolean>(() => this._user()?.roles.includes('admin') ?? false);

  // Login
  login(email: string, password: string): Observable<boolean> {
    return this.http.post<AuthResponse>(`${baseUrl}/auth/login`, {
      email,
      password,
    })
      .pipe(
        map((resp) => this.handleAuthSuccess(resp)),
        catchError((error: any) => this.handleAuthError(error)),
      );
  }

  register(email: string, password: string, fullName: string): Observable<boolean> {
    return this.http.post<AuthResponse>(`${baseUrl}/auth/register`, {
      email,
      password,
      fullName,
    })
      .pipe(
        map((resp) => this.handleAuthSuccess(resp)),
        catchError((error: any) => this.handleAuthError(error)),
      );
  }


  //Check Authenticated User
  checkAuthStatus(): Observable<boolean> {
    const token = localStorage.getItem('token');
    if (!token) {
      this.logout();
      return of(false);
    }
    return this.http.get<AuthResponse>(`${baseUrl}/auth/check-status`, {
      //headers: {
      //  Authorization: `Bearer ${token}`,
      //},
    }).pipe(
      map((resp) => this.handleAuthSuccess(resp)),
      catchError((error: any) => this.handleAuthError(error)),
    );
  }

  // Logout
  logout() {
    this._token.set(null);
    this._user.set(null);
    this._authstatus.set('not-authenticated');
    localStorage.removeItem('token');
  }
  // Handle Auth Success and Error
  private handleAuthSuccess({ token, user }: AuthResponse) {
    this._token.set(token);
    this._user.set(user);
    this._authstatus.set('authenticated');

    localStorage.setItem('token', token);
    return true;
  }
  private handleAuthError(error: any) {
    this.logout();
    return of(false);
  }
}
