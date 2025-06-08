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

  async logout(token: string): Promise<void> {
    await this.db.query('DELETE FROM tokens WHERE token=$1', [token]);
  }

  async getProfile(token: string) {
    const userId = await this.db.getUserIdByToken(token);
    if (!userId) return null;
    const res = await this.db.query(
      'SELECT display_name FROM profiles WHERE user_id=$1',
      [userId]
    );
    return res.rowCount ? res.rows[0] : { display_name: '' };
  }

  async updateProfile(token: string, displayName: string) {
    const userId = await this.db.getUserIdByToken(token);
    if (!userId) return false;
    await this.db.query(
      `INSERT INTO profiles(user_id, display_name)
       VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET display_name=excluded.display_name`,
      [userId, displayName]
    );
    return true;
  }

  async listProducts(token: string) {
    const userId = await this.db.getUserIdByToken(token);
    if (!userId) return [];
    const res = await this.db.query(
      'SELECT id, name, description, price, marketplace, profit FROM products WHERE user_id=$1',
      [userId]
    );
    return res.rows;
  }

  async addProduct(token: string, product: any) {
    const userId = await this.db.getUserIdByToken(token);
    if (!userId) return null;
    const res = await this.db.query(
      'INSERT INTO products(user_id, name, description, price, marketplace, profit) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [userId, product.name, product.description, product.price, product.marketplace, 0]
    );
    return res.rows[0].id;
  }

  async updateProduct(token: string, product: any) {
    const userId = await this.db.getUserIdByToken(token);
    if (!userId) return false;
    await this.db.query(
      'UPDATE products SET name=$1, description=$2, price=$3, marketplace=$4 WHERE id=$5 AND user_id=$6',
      [product.name, product.description, product.price, product.marketplace, product.id, userId]
    );
    return true;
  }

  async getDashboard(token: string) {
    const userId = await this.db.getUserIdByToken(token);
    if (!userId) return [];
    const res = await this.db.query(
      'SELECT marketplace, COUNT(*) AS count, COALESCE(SUM(profit),0) AS profit FROM products WHERE user_id=$1 GROUP BY marketplace',
      [userId]
    );
    return res.rows;
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
      } else if (msg.type === 'logout') {
        await this.logout(msg.token);
        ws.send(JSON.stringify({ type: 'logout', success: true }));
      } else if (msg.type === 'getProfile') {
        const profile = await this.getProfile(msg.token);
        ws.send(JSON.stringify({ type: 'getProfile', profile }));
      } else if (msg.type === 'updateProfile') {
        const success = await this.updateProfile(msg.token, msg.displayName);
        ws.send(JSON.stringify({ type: 'updateProfile', success }));
      } else if (msg.type === 'listProducts') {
        const products = await this.listProducts(msg.token);
        ws.send(JSON.stringify({ type: 'listProducts', products }));
      } else if (msg.type === 'addProduct') {
        const id = await this.addProduct(msg.token, msg.product);
        ws.send(JSON.stringify({ type: 'addProduct', id }));
      } else if (msg.type === 'updateProduct') {
        const success = await this.updateProduct(msg.token, msg.product);
        ws.send(JSON.stringify({ type: 'updateProduct', success }));
      } else if (msg.type === 'getDashboard') {
        const dashboard = await this.getDashboard(msg.token);
        ws.send(JSON.stringify({ type: 'getDashboard', dashboard }));
      }
    } catch (err) {
      ws.send(JSON.stringify({ type: 'error', message: 'Server error' }));
    }
  }
}
