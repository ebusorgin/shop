import { Component } from '@angular/core';
import { ProductService } from '../services/product.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-product',
  templateUrl: 'add-product.page.html',
  styleUrls: ['add-product.page.scss']
})
export class AddProductPage {
  product: any = { name: '', description: '', price: 0, marketplace: '' };

  constructor(private products: ProductService, private auth: AuthService, private router: Router) {}

  save() {
    this.products.add(this.auth.getToken(), this.product).subscribe(() => {
      this.router.navigateByUrl('/tabs/main');
    });
  }
}
