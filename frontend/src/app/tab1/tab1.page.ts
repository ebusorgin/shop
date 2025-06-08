import { Component } from '@angular/core';
import { ProductService } from '../services/product.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  summary: any[] = [];

  constructor(private productsService: ProductService, private auth: AuthService) {}

  ionViewWillEnter() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.productsService.dashboard(this.auth.getToken()).subscribe((m: any) => {
      this.summary = m.dashboard;
    });
  }
}
