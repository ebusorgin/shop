import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export class Database {
  private pool: Pool;

  constructor() {
    this.pool = new Pool(this.getConfig());
  }

  private getConfig(): PoolConfig {
    return {
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: Number(process.env.DB_PORT) || 5432,
    } as PoolConfig;
  }

  async query<T = any>(queryText: string, params: any[] = []): Promise<T[]> {
    const { rows } = await this.pool.query(queryText, params);
    return rows as T[];
  }

  async init() {
    await this.pool.connect();
    await this.createTables();
    await this.ensureAdmin();
  }

  private async createTables() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      );
    `);

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token TEXT UNIQUE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
  }

  private async ensureAdmin() {
    const res = await this.pool.query('SELECT COUNT(*) FROM users WHERE email=$1', ['admin@example.com']);
    if (res.rows[0].count === '0') {
      await this.pool.query('INSERT INTO users(email, password) VALUES ($1, $2)', ['admin@example.com', 'admin']);
    }
  }

  async authenticate(email: string, password: string): Promise<string | null> {
    const result = await this.pool.query('SELECT id FROM users WHERE email=$1 AND password=$2', [email, password]);
    if (result.rowCount > 0) {
      const userId = result.rows[0].id;
      const token = Math.random().toString(36).substring(2);
      await this.pool.query('INSERT INTO tokens(user_id, token) VALUES ($1, $2)', [userId, token]);
      return token;
    }
    return null;
  }

  async register(email: string, password: string): Promise<string | null> {
    try {
      const res = await this.pool.query('INSERT INTO users(email, password) VALUES ($1, $2) RETURNING id', [email, password]);
      const userId = res.rows[0].id;
      const token = Math.random().toString(36).substring(2);
      await this.pool.query('INSERT INTO tokens(user_id, token) VALUES ($1, $2)', [userId, token]);
      return token;
    } catch {
      return null;
    }
  }

  async verify(token: string): Promise<boolean> {
    const res = await this.pool.query('SELECT id FROM tokens WHERE token=$1', [token]);
    return res.rowCount > 0;
  }
}


