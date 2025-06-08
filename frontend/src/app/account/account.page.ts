import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-account',
  templateUrl: 'account.page.html',
  styleUrls: ['account.page.scss']
})
export class AccountPage {
  displayName = '';

  constructor(public auth: AuthService) {}

  ionViewWillEnter() {
    this.auth.getProfile().subscribe((msg: any) => {
      this.displayName = msg.profile.display_name || '';
    });
  }

  saveProfile() {
    this.auth.updateProfile(this.displayName).subscribe();
  }

  logout() {
    this.auth.logout();
  }
}
