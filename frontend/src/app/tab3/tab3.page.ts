import { Component } from '@angular/core';
import { ProductService } from '../services/product.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
  count = 0;

  constructor(private productsService: ProductService, private auth: AuthService) {}

  ionViewWillEnter() {
    this.productsService.list(this.auth.getToken()).subscribe((m: any) => {
      this.count = m.products.length;
    });
  }

}
