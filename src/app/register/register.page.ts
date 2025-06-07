import { Component } from '@angular/core';
import { WsService } from '../services/ws.service';

@Component({
  selector: 'app-register',
  templateUrl: 'register.page.html',
  styleUrls: ['register.page.scss']
})
export class RegisterPage {
  email = '';
  password = '';
  confirm = '';

  constructor(private ws: WsService) {}

  register() {
    if (this.password !== this.confirm) {
      console.error('Passwords do not match');
      return;
    }
    this.ws.send({
      type: 'register',
      email: this.email,
      password: this.password
    });
  }
}
