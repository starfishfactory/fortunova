import { getDatabase } from '@/db/connection.js';

export interface Plan {
  id: 'monthly' | 'yearly';
  name: string;
  price: number;
  period: string;
}

export interface Subscription {
  id: number;
  userId: number;
  plan: 'monthly' | 'yearly';
  status: 'active' | 'cancelled' | 'expired';
  startDate: string;
  endDate: string;
  createdAt: string;
}

const PLANS: Plan[] = [
  { id: 'monthly', name: '월간 구독', price: 9900, period: '1개월' },
  { id: 'yearly', name: '연간 구독', price: 99000, period: '1년' },
];

export function getPlans(): Plan[] {
  return PLANS;
}

export function checkSubscription(userId: number): Subscription | null {
  const db = getDatabase();
  const today = new Date().toISOString().slice(0, 10);

  const row = db.prepare(
    `SELECT id, user_id, plan, status, start_date, end_date, created_at
     FROM subscriptions
     WHERE user_id = ? AND status = 'active' AND end_date >= ?
     ORDER BY end_date DESC LIMIT 1`,
  ).get(userId, today) as {
    id: number;
    user_id: number;
    plan: 'monthly' | 'yearly';
    status: 'active' | 'cancelled' | 'expired';
    start_date: string;
    end_date: string;
    created_at: string;
  } | undefined;

  if (!row) return null;

  return {
    id: row.id,
    userId: row.user_id,
    plan: row.plan,
    status: row.status,
    startDate: row.start_date,
    endDate: row.end_date,
    createdAt: row.created_at,
  };
}

export function createSubscription(
  userId: number,
  plan: 'monthly' | 'yearly',
): Subscription {
  const db = getDatabase();
  const now = new Date();
  const startDate = now.toISOString().slice(0, 10);

  const endDate = new Date(now);
  if (plan === 'monthly') {
    endDate.setMonth(endDate.getMonth() + 1);
  } else {
    endDate.setFullYear(endDate.getFullYear() + 1);
  }

  const result = db.prepare(
    `INSERT INTO subscriptions (user_id, plan, status, start_date, end_date, created_at)
     VALUES (?, ?, 'active', ?, ?, ?)`,
  ).run(userId, plan, startDate, endDate.toISOString().slice(0, 10), now.toISOString());

  return {
    id: result.lastInsertRowid as number,
    userId,
    plan,
    status: 'active',
    startDate,
    endDate: endDate.toISOString().slice(0, 10),
    createdAt: now.toISOString(),
  };
}

export function cancelSubscription(userId: number): boolean {
  const db = getDatabase();

  const result = db.prepare(
    `UPDATE subscriptions SET status = 'cancelled'
     WHERE user_id = ? AND status = 'active'`,
  ).run(userId);

  return result.changes > 0;
}
