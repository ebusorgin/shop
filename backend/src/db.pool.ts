import { Pool, PoolConfig, QueryResult } from 'pg';
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

  async query<T = any>(queryText: string, params: any[] = []): Promise<QueryResult<T>> {
    return this.pool.query(queryText, params);
  }

  async init() {
    await this.pool.connect();
    await this.createTables();
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

}


