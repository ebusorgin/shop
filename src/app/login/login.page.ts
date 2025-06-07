import { Component } from '@angular/core';
import { WsService } from '../services/ws.service';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss']
})
export class LoginPage {
  email = '';
  password = '';

  constructor(private ws: WsService) {}

  login() {
    this.ws.send({
      type: 'login',
      email: this.email,
      password: this.password
    });
  }
}
