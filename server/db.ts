import { Pool } from 'pg';

export class Database {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      user: 'postgres',
      password: 'postgres',
      database: 'shop',
      host: 'localhost',
      port: 5432,
    });
  }

  async init() {
    await this.pool.connect();
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        token TEXT
      );
    `);
    const res = await this.pool.query('SELECT COUNT(*) FROM users WHERE email=$1', ['admin@example.com']);
    if (res.rows[0].count === '0') {
      await this.pool.query(
        'INSERT INTO users(email, password) VALUES ($1, $2)',
        ['admin@example.com', 'admin']
      );
    }
  }

  async authenticate(email: string, password: string): Promise<string | null> {
    const result = await this.pool.query('SELECT id FROM users WHERE email=$1 AND password=$2', [email, password]);
    if (result.rowCount > 0) {
      const token = Math.random().toString(36).substring(2);
      await this.pool.query('UPDATE users SET token=$1 WHERE email=$2', [token, email]);
      return token;
    }
    return null;
  }

  async register(email: string, password: string): Promise<string | null> {
    try {
      const token = Math.random().toString(36).substring(2);
      await this.pool.query('INSERT INTO users(email, password, token) VALUES ($1, $2, $3)', [email, password, token]);
      return token;
    } catch {
      return null;
    }
  }

  async verify(token: string): Promise<boolean> {
    const res = await this.pool.query('SELECT id FROM users WHERE token=$1', [token]);
    return res.rowCount > 0;
  }
}
