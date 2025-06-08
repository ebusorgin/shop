import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { ProductService } from '../services/product.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  products: any[] = [];
  summary: any[] = [];

  constructor(
    private productsService: ProductService,
    private auth: AuthService,
    private router: Router
  ) {}

  ionViewWillEnter() {
    this.loadProducts();
    this.loadDashboard();

  }

  loadProducts() {
    this.productsService.list(this.auth.getToken()).subscribe((m: any) => {
      this.products = m.products;
    });
  }

  loadDashboard() {
    this.productsService.dashboard(this.auth.getToken()).subscribe((m: any) => {
      this.summary = m.dashboard;
    });
  }

  goAddProduct() {
    this.router.navigateByUrl('/add-product');

  }
}
