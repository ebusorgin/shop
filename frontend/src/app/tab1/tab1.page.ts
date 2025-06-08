import { Component } from '@angular/core';
import { ProductService } from '../services/product.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  products: any[] = [];
  newProduct: any = { name: '', description: '', price: 0 };

  constructor(private productsService: ProductService, private auth: AuthService) {}

  ionViewWillEnter() {
    this.loadProducts();
  }

  loadProducts() {
    this.productsService.list(this.auth.getToken()).subscribe((m: any) => {
      this.products = m.products;
    });
  }

  saveProduct() {
    if (this.newProduct.id) {
      this.productsService
        .update(this.auth.getToken(), this.newProduct)
        .subscribe(() => this.loadProducts());
    } else {
      this.productsService
        .add(this.auth.getToken(), this.newProduct)
        .subscribe(() => this.loadProducts());
    }
    this.newProduct = { name: '', description: '', price: 0 };
  }

  editProduct(p: any) {
    this.newProduct = { ...p };
  }

}
