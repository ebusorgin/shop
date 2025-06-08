import pkg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pkg;

dotenv.config();

export class Database {
  private pool: any;


  constructor() {
    this.pool = new Pool(this.getConfig());
  }

  private getConfig() {

    return {
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      schema: process.env.DB_SCHEMA,
      port: Number(process.env.DB_PORT) || 5432,
    };
  }

  async query(queryText: string, params: any[] = []) {

    return this.pool.query(queryText, params);
  }

  async init() {
    await this.pool.connect();
    await this.createTables();
  }

  private async createTables() {

    const rr = await this.pool.query(`
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

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        display_name TEXT
      );
    `);

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        price NUMERIC(10,2) DEFAULT 0
      );
    `);
  }

  async getUserIdByToken(token: string): Promise<number | null> {
    const res = await this.pool.query('SELECT user_id FROM tokens WHERE token=$1', [token]);
    if (res.rowCount && res.rowCount > 0) {
      return res.rows[0].user_id;
    }
    return null;
  }

}


