import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { WsService } from './ws.service';
import { filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'auth_token';
  private emailKey = 'auth_email';

  constructor(private ws: WsService, private router: Router) {}

  init() {
    const token = localStorage.getItem(this.tokenKey);
    if (token) {
      this.ws.send({ type: 'verify', token });
      this.ws
        .listen()
        .pipe(filter(msg => msg.type === 'verify'))
        .subscribe(msg => {
          if (msg.valid) {
            this.router.navigateByUrl('/tabs/main');
          } else {
            localStorage.removeItem(this.tokenKey);
            this.router.navigateByUrl('/login');
          }
        });
    } else {
      this.router.navigateByUrl('/login');
    }
  }

  login(email: string, password: string) {
    this.ws.send({ type: 'login', email, password });
    return this.ws.listen().pipe(filter(m => m.type === 'login'));
  }

  navigateMain() {
    this.router.navigateByUrl('/tabs/main');
  }

  logout() {
    const token = localStorage.getItem(this.tokenKey);
    if (token) {
      this.ws.send({ type: 'logout', token });
    }
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.emailKey);
    this.router.navigateByUrl('/login');
  }

  register(email: string, password: string) {
    this.ws.send({ type: 'register', email, password });
    return this.ws.listen().pipe(filter(m => m.type === 'register'));
  }

  storeToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  storeEmail(email: string) {
    localStorage.setItem(this.emailKey, email);
  }

  getEmail(): string {
    return localStorage.getItem(this.emailKey) || '';
  }

  getToken(): string {
    return localStorage.getItem(this.tokenKey) || '';
  }

  getProfile() {
    const token = this.getToken();
    this.ws.send({ type: 'getProfile', token });
    return this.ws.listen().pipe(filter(m => m.type === 'getProfile'));
  }

  updateProfile(displayName: string) {
    const token = this.getToken();
    this.ws.send({ type: 'updateProfile', token, displayName });
    return this.ws.listen().pipe(filter(m => m.type === 'updateProfile'));
  }
}
