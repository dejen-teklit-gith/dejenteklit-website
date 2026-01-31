import Database from 'better-sqlite3';

const db = new Database('orders.db');

db.prepare(`
  CREATE TABLE IF NOT EXISTS orders (
                                      id INTEGER PRIMARY KEY AUTOINCREMENT,
                                      session_id TEXT,
                                      customer_email TEXT,
                                      items TEXT,
                                      total_amount REAL,
                                      created_at TEXT
  )
`).run();

export default db;
