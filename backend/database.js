// backend/database.js
import Database from 'better-sqlite3';

const db = new Database('orders.db');

// ✅ Enforce foreign keys (SQLite requires PRAGMA)
db.pragma('foreign_keys = ON');

// ---------------------- HELPERS ----------------------
function tableExists(name) {
  const row = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`).get(name);
  return !!row;
}

function getColumns(tableName) {
  // PRAGMA returns rows like: {cid, name, type, notnull, dflt_value, pk}
  const rows = db.prepare(`PRAGMA table_info(${tableName})`).all();
  return rows.map(r => r.name);
}

function addColumnIfMissing(tableName, columnName, columnDefSql) {
  const cols = getColumns(tableName);
  if (!cols.includes(columnName)) {
    db.prepare(`ALTER TABLE ${tableName} ADD COLUMN ${columnDefSql}`).run();
    console.log(`✅ Migrated: added column ${tableName}.${columnName}`);
  }
}

// ---------------------- USERS ----------------------
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
                                     id INTEGER PRIMARY KEY AUTOINCREMENT,
                                     first_name TEXT,
                                     last_name TEXT,
                                     email TEXT UNIQUE NOT NULL,
                                     password_hash TEXT NOT NULL,
                                     created_at TEXT NOT NULL
  )
`).run();

// ---------------------- ORDERS ----------------------
/**
 * Your older DB may already have an orders table without user_id/customer_email.
 * So:
 * 1) Create it if missing.
 * 2) If it exists, migrate missing columns.
 */
if (!tableExists('orders')) {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT UNIQUE,
      user_id INTEGER,
      customer_email TEXT,
      items TEXT NOT NULL,
      total_amount REAL NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `).run();
  console.log('✅ Created orders table');
} else {
  // Migrate older schema
  addColumnIfMissing('orders', 'session_id', 'session_id TEXT');
  addColumnIfMissing('orders', 'user_id', 'user_id INTEGER');
  addColumnIfMissing('orders', 'customer_email', 'customer_email TEXT');
  addColumnIfMissing('orders', 'items', 'items TEXT');
  addColumnIfMissing('orders', 'total_amount', 'total_amount REAL');
  addColumnIfMissing('orders', 'created_at', 'created_at TEXT');
}

// ---------------------- SUBSCRIBERS ----------------------
db.prepare(`
  CREATE TABLE IF NOT EXISTS subscribers (
                                           id INTEGER PRIMARY KEY AUTOINCREMENT,
                                           email TEXT UNIQUE NOT NULL,
                                           created_at TEXT NOT NULL
  )
`).run();
// ---------------------- PASSWORD RESETS ----------------------
db.prepare(`
  CREATE TABLE IF NOT EXISTS password_resets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at TEXT NOT NULL,
    used INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`).run();

// ---------------------- INDEXES ----------------------
// Only create indexes if the columns exist (after migration)
const orderCols = getColumns('orders');

if (orderCols.includes('user_id')) {
  db.prepare(`CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)`).run();
}
if (orderCols.includes('customer_email')) {
  db.prepare(`CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email)`).run();
}
if (orderCols.includes('created_at')) {
  db.prepare(`CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)`).run();
}

export default db;
