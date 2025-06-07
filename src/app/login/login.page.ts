import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss']
})
export class LoginPage {
  email = '';
  password = '';

  constructor() {}

  login() {
    console.log('Login', this.email, this.password);
  }
}
