import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WsService {
  private socket: WebSocket;
  private messages = new Subject<any>();

  constructor() {
    this.socket = new WebSocket('ws://localhost:8080');
    this.socket.onmessage = (event) => {
      this.messages.next(JSON.parse(event.data));
    };
  }

  send(data: any) {
    this.socket.send(JSON.stringify(data));
  }

  listen(): Observable<any> {
    return this.messages.asObservable();
  }
}
