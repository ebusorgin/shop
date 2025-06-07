import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { WsService } from './ws.service';
import { filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'auth_token';

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

  register(email: string, password: string) {
    this.ws.send({ type: 'register', email, password });
    return this.ws.listen().pipe(filter(m => m.type === 'register'));
  }

  storeToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }
}
