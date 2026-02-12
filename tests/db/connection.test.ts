import { describe, it, expect, afterEach } from 'vitest';
import { existsSync, unlinkSync, mkdirSync } from 'fs';
import { createDatabase, closeDatabase } from '../../src/db/connection.js';
import { migrateDatabase } from '../../src/db/migrate.js';

const TEST_DB_PATH = './data/test-connection.db';

describe('DB Connection', () => {
  afterEach(() => {
    closeDatabase();
    for (const suffix of ['', '-wal', '-shm']) {
      const file = TEST_DB_PATH + suffix;
      if (existsSync(file)) unlinkSync(file);
    }
  });

  it('SQLite 데이터베이스에 연결한다', () => {
    mkdirSync('./data', { recursive: true });
    const db = createDatabase(TEST_DB_PATH);
    expect(db).toBeDefined();
  });

  it('WAL 모드가 활성화되어 있다', () => {
    mkdirSync('./data', { recursive: true });
    const db = createDatabase(TEST_DB_PATH);
    const result = db.pragma('journal_mode');
    expect(result).toEqual([{ journal_mode: 'wal' }]);
  });

  it('busy_timeout이 5000ms로 설정되어 있다', () => {
    mkdirSync('./data', { recursive: true });
    const db = createDatabase(TEST_DB_PATH);
    const result = db.pragma('busy_timeout');
    expect(result).toEqual([{ timeout: 5000 }]);
  });

  it('foreign_keys가 활성화되어 있다', () => {
    mkdirSync('./data', { recursive: true });
    const db = createDatabase(TEST_DB_PATH);
    const result = db.pragma('foreign_keys');
    expect(result).toEqual([{ foreign_keys: 1 }]);
  });
});

describe('DB Migration', () => {
  afterEach(() => {
    closeDatabase();
    for (const suffix of ['', '-wal', '-shm']) {
      const file = TEST_DB_PATH + suffix;
      if (existsSync(file)) unlinkSync(file);
    }
  });

  it('마이그레이션 후 모든 테이블이 생성된다', () => {
    mkdirSync('./data', { recursive: true });
    const db = createDatabase(TEST_DB_PATH);
    migrateDatabase(db);

    const tables = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
    ).all() as { name: string }[];
    const tableNames = tables.map((t) => t.name);

    expect(tableNames).toContain('users');
    expect(tableNames).toContain('fortune_cache');
    expect(tableNames).toContain('daily_usage');
    expect(tableNames).toContain('subscriptions');
    expect(tableNames).toContain('payments');
  });

  it('마이그레이션을 두 번 실행해도 에러가 발생하지 않는다', () => {
    mkdirSync('./data', { recursive: true });
    const db = createDatabase(TEST_DB_PATH);
    migrateDatabase(db);
    expect(() => migrateDatabase(db)).not.toThrow();
  });
});
