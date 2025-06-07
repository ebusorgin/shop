import { Database } from './db.pool';
import { WebSocket } from 'ws';

export class AuthController {
  constructor(private db: Database) {}

  async handleMessage(ws: WebSocket, data: string) {
    try {
      const msg = JSON.parse(data);
      if (msg.type === 'login') {
        const token = await this.db.authenticate(msg.email, msg.password);
        ws.send(JSON.stringify({ type: 'login', success: !!token, token }));
      } else if (msg.type === 'register') {
        const token = await this.db.register(msg.email, msg.password);
        ws.send(JSON.stringify({ type: 'register', success: !!token, token }));
      } else if (msg.type === 'verify') {
        const valid = await this.db.verify(msg.token);
        ws.send(JSON.stringify({ type: 'verify', valid }));
      }
    } catch (err) {
      ws.send(JSON.stringify({ type: 'error', message: 'Server error' }));
    }
  }
}
