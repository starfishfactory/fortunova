import Database from 'better-sqlite3';

let db: Database.Database | null = null;

export function createDatabase(dbPath: string): Database.Database {
  db = new Database(dbPath);

  // WAL 모드 활성화 (동시성 향상)
  db.pragma('journal_mode = WAL');
  // busy_timeout 설정 (잠금 대기)
  db.pragma('busy_timeout = 5000');
  // 외래 키 제약 활성화
  db.pragma('foreign_keys = ON');

  return db;
}

export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call createDatabase() first.');
  }
  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
