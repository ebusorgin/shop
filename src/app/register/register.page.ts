import { Component } from '@angular/core';

@Component({
  selector: 'app-register',
  templateUrl: 'register.page.html',
  styleUrls: ['register.page.scss']
})
export class RegisterPage {
  email = '';
  password = '';
  confirm = '';

  constructor() {}

  register() {
    console.log('Register', this.email, this.password, this.confirm);
  }
}
