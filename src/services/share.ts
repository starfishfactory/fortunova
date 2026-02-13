import { randomBytes } from 'crypto';
import { getDatabase } from '@/db/connection.js';
import type { FortuneResult } from '@/fortune/types.js';

export interface SharedFortune {
  id: string;
  fortune: FortuneResult;
  sajuSummary: {
    fourPillars: string;
    dayMasterStrength: string;
    todayElement: string;
  };
  category: string;
  createdAt: string;
  expiresAt: string;
}

export function createSharedFortune(
  fortune: FortuneResult,
  sajuSummary: { fourPillars: string; dayMasterStrength: string; todayElement: string },
  category: string,
): SharedFortune {
  const db = getDatabase();
  const id = randomBytes(8).toString('hex');
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + 7); // 7일 후 만료

  db.prepare(
    `INSERT INTO shared_fortunes (id, fortune, saju_summary, category, created_at, expires_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    JSON.stringify(fortune),
    JSON.stringify(sajuSummary),
    category,
    now.toISOString(),
    expiresAt.toISOString(),
  );

  return {
    id,
    fortune,
    sajuSummary,
    category,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
}

export function getSharedFortune(id: string): SharedFortune | null {
  const db = getDatabase();

  const row = db.prepare(
    'SELECT id, fortune, saju_summary, category, created_at, expires_at FROM shared_fortunes WHERE id = ?',
  ).get(id) as {
    id: string;
    fortune: string;
    saju_summary: string;
    category: string;
    created_at: string;
    expires_at: string;
  } | undefined;

  if (!row) return null;

  // 만료 확인
  if (new Date(row.expires_at) < new Date()) return null;

  return {
    id: row.id,
    fortune: JSON.parse(row.fortune),
    sajuSummary: JSON.parse(row.saju_summary),
    category: row.category,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
  };
}
