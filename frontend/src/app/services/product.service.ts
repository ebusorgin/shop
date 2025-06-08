import { Injectable } from '@angular/core';
import { WsService } from './ws.service';
import { filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private ws: WsService) {}

  list(token: string) {
    this.ws.send({ type: 'listProducts', token });
    return this.ws.listen().pipe(filter(m => m.type === 'listProducts'));
  }

  add(token: string, product: any) {
    this.ws.send({ type: 'addProduct', token, product });
    return this.ws.listen().pipe(filter(m => m.type === 'addProduct'));
  }

  update(token: string, product: any) {
    this.ws.send({ type: 'updateProduct', token, product });
    return this.ws.listen().pipe(filter(m => m.type === 'updateProduct'));
  }
}
