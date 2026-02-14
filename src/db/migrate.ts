import type Database from 'better-sqlite3';

const CREATE_TABLES_SQL = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    gender TEXT NOT NULL CHECK(gender IN ('M', 'F')),
    birth_year INTEGER NOT NULL,
    birth_month INTEGER NOT NULL,
    birth_day INTEGER NOT NULL,
    birth_hour INTEGER,
    is_lunar INTEGER NOT NULL DEFAULT 0,
    is_leap_month INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS fortune_cache (
    cache_key TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    category TEXT NOT NULL,
    system_id TEXT NOT NULL,
    saju_data TEXT NOT NULL,
    fortune TEXT NOT NULL,
    score INTEGER,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_fortune_cache_date ON fortune_cache(date);
  CREATE INDEX IF NOT EXISTS idx_fortune_cache_expires ON fortune_cache(expires_at);

  CREATE TABLE IF NOT EXISTS daily_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    identifier TEXT NOT NULL,
    identifier_type TEXT NOT NULL CHECK(identifier_type IN ('user', 'anonymous')),
    date TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 0
  );

  CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_usage_unique ON daily_usage(identifier, date);

  CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    plan TEXT NOT NULL CHECK(plan IN ('monthly', 'yearly')),
    status TEXT NOT NULL CHECK(status IN ('active', 'cancelled', 'expired')),
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    amount INTEGER NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('pending', 'completed', 'failed', 'refunded')),
    provider TEXT NOT NULL CHECK(provider IN ('toss', 'kakao')),
    provider_payment_id TEXT,
    created_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);

  CREATE TABLE IF NOT EXISTS shared_fortunes (
    id TEXT PRIMARY KEY,
    fortune TEXT NOT NULL,
    saju_summary TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_shared_fortunes_expires ON shared_fortunes(expires_at);
`;

export function migrateDatabase(db: Database.Database): void {
  db.exec(CREATE_TABLES_SQL);
}
