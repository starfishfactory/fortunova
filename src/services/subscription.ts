import { getDatabase } from '@/db/connection.js';

export interface SubscriptionPlan {
  id: 'monthly' | 'yearly';
  name: string;
  price: number;
  durationMonths: number;
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

const PLANS: SubscriptionPlan[] = [
  { id: 'monthly', name: '월간 구독', price: 9900, durationMonths: 1 },
  { id: 'yearly', name: '연간 구독', price: 99000, durationMonths: 12 },
];

export function getPlans(): SubscriptionPlan[] {
  return PLANS;
}

export function subscribe(userId: number, planId: 'monthly' | 'yearly'): Subscription {
  const db = getDatabase();

  // Check for existing active subscription
  const existing = db.prepare(
    "SELECT id, status, end_date FROM subscriptions WHERE user_id = ? AND status = 'active' AND end_date > ?",
  ).get(userId, new Date().toISOString()) as { id: number; status: string; end_date: string } | undefined;

  if (existing) {
    throw new Error('ALREADY_SUBSCRIBED');
  }

  const plan = PLANS.find((p) => p.id === planId)!;
  const now = new Date();
  const startDate = now.toISOString();
  const endDate = new Date(now);
  endDate.setMonth(endDate.getMonth() + plan.durationMonths);

  const result = db.prepare(
    `INSERT INTO subscriptions (user_id, plan, status, start_date, end_date, created_at)
     VALUES (?, ?, 'active', ?, ?, ?)`,
  ).run(userId, planId, startDate, endDate.toISOString(), startDate);

  return {
    id: result.lastInsertRowid as number,
    userId,
    plan: planId,
    status: 'active',
    startDate,
    endDate: endDate.toISOString(),
    createdAt: startDate,
  };
}

export function hasActiveSubscription(userId: number): boolean {
  const db = getDatabase();
  const row = db.prepare(
    "SELECT id FROM subscriptions WHERE user_id = ? AND status = 'active' AND end_date > ?",
  ).get(userId, new Date().toISOString());
  return !!row;
}

export function getUserSubscription(userId: number): Subscription | null {
  const db = getDatabase();
  const row = db.prepare(
    'SELECT id, user_id, plan, status, start_date, end_date, created_at FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
  ).get(userId) as {
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

export function cancelSubscription(subscriptionId: number, userId: number): void {
  const db = getDatabase();

  const row = db.prepare(
    'SELECT id, user_id, status FROM subscriptions WHERE id = ?',
  ).get(subscriptionId) as { id: number; user_id: number; status: string } | undefined;

  if (!row || row.user_id !== userId) {
    throw new Error('SUBSCRIPTION_NOT_FOUND');
  }

  if (row.status === 'cancelled') {
    throw new Error('ALREADY_CANCELLED');
  }

  db.prepare(
    "UPDATE subscriptions SET status = 'cancelled' WHERE id = ?",
  ).run(subscriptionId);
}
