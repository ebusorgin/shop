import { Database } from './db.pool';
import { WebSocket } from 'ws';

export class AuthController {
  constructor(private db: Database) {
    this.ensureAdmin();
  }

  private async ensureAdmin() {
    const res = await this.db.query('SELECT COUNT(*) FROM users WHERE email=$1', [
      'admin@example.com',
    ]);
    if (res.rows[0].count === '0') {
      await this.db.query('INSERT INTO users(email, password) VALUES ($1, $2)', [
        'admin@example.com',
        'admin',
      ]);
    }
  }

  async authenticate(email: string, password: string): Promise<string | null> {
    const result = await this.db.query(
      'SELECT id FROM users WHERE email=$1 AND password=$2',
      [email, password]
    );
    if (result.rowCount && result.rowCount > 0) {
      const userId = result.rows[0].id;
      const token = Math.random().toString(36).substring(2);
      await this.db.query('INSERT INTO tokens(user_id, token) VALUES ($1, $2)', [
        userId,
        token,
      ]);
      return token;
    }
    return null;
  }

  async register(email: string, password: string): Promise<string | null> {
    try {
      const res = await this.db.query(
        'INSERT INTO users(email, password) VALUES ($1, $2) RETURNING id',
        [email, password]
      );
      const userId = res.rows[0].id;
      const token = Math.random().toString(36).substring(2);
      await this.db.query('INSERT INTO tokens(user_id, token) VALUES ($1, $2)', [
        userId,
        token,
      ]);
      return token;
    } catch {
      return null;
    }
  }

  async verify(token: string): Promise<boolean> {
    const res = await this.db.query('SELECT id FROM tokens WHERE token=$1', [
      token,
    ]);
    return !!(res.rowCount && res.rowCount > 0);
  }

  async handleMessage(ws: any, data: string) {
    try {
      const msg = JSON.parse(data);
      if (msg.type === 'login') {
        const token = await this.authenticate(msg.email, msg.password);
        ws.send(JSON.stringify({ type: 'login', success: !!token, token }));
      } else if (msg.type === 'register') {
        const token = await this.register(msg.email, msg.password);
        ws.send(JSON.stringify({ type: 'register', success: !!token, token }));
      } else if (msg.type === 'verify') {
        const valid = await this.verify(msg.token);
        ws.send(JSON.stringify({ type: 'verify', valid }));
      }
    } catch (err) {
      ws.send(JSON.stringify({ type: 'error', message: 'Server error' }));
    }
  }
}
