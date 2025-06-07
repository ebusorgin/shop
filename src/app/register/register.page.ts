import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: 'register.page.html',
  styleUrls: ['register.page.scss']
})
export class RegisterPage {
  email = '';
  password = '';
  confirm = '';

  constructor(private auth: AuthService) {}

  register() {
    if (this.password !== this.confirm) {
      console.error('Passwords do not match');
      return;
    }
    this.auth.register(this.email, this.password).subscribe(res => {
      if (res.success) {
        this.auth.storeToken(res.token);
        this.auth.navigateMain();
      }
    });
  }
}
