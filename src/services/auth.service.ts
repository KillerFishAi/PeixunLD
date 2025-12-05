import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../environments/environment';

// We'll need to create environment files later, but for now we can default to empty or assume relative path
// If serving from same origin, API_URL can be empty string or /api
const API_URL = ''; 

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'liande_auth_token';
  isAuthenticated = signal<boolean>(false);

  constructor(private http: HttpClient, private router: Router) {
    this.checkToken();
  }

  checkToken() {
    const token = localStorage.getItem(this.tokenKey);
    this.isAuthenticated.set(!!token);
  }

  login(username: string, password: string) {
    const body = new URLSearchParams();
    body.set('username', username);
    body.set('password', password);

    return this.http.post<any>(`${API_URL}/token`, body.toString(), {
      headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
    }).pipe(
      tap(res => {
        localStorage.setItem(this.tokenKey, res.access_token);
        this.isAuthenticated.set(true);
        this.router.navigate(['/admin']);
      })
    );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  getToken() {
    return localStorage.getItem(this.tokenKey);
  }
}
