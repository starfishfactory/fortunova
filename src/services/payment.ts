import { getDatabase } from '@/db/connection.js';
import { randomUUID } from 'crypto';

export interface Payment {
  id: number;
  userId: number;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  provider: string;
  providerPaymentId: string | null;
  createdAt: string;
}

export interface PaymentInitResult {
  success: boolean;
  paymentKey: string;
  orderId: string;
}

export interface PaymentConfirmResult {
  success: boolean;
  paymentKey: string;
  approvedAt: string;
}

export interface PaymentGateway {
  createPayment(amount: number, orderId: string): Promise<PaymentInitResult>;
  confirmPayment(paymentKey: string, orderId: string, amount: number): Promise<PaymentConfirmResult>;
}

export class MockPaymentGateway implements PaymentGateway {
  async createPayment(amount: number, orderId: string): Promise<PaymentInitResult> {
    return {
      success: true,
      paymentKey: `mock_pk_${randomUUID()}`,
      orderId,
    };
  }

  async confirmPayment(paymentKey: string, _orderId: string, _amount: number): Promise<PaymentConfirmResult> {
    return {
      success: true,
      paymentKey,
      approvedAt: new Date().toISOString(),
    };
  }
}

export function createPaymentRecord(userId: number, amount: number, provider: string): Payment {
  const db = getDatabase();
  const now = new Date().toISOString();

  const result = db.prepare(
    `INSERT INTO payments (user_id, amount, status, provider, created_at)
     VALUES (?, ?, 'pending', ?, ?)`,
  ).run(userId, amount, provider, now);

  return {
    id: result.lastInsertRowid as number,
    userId,
    amount,
    status: 'pending',
    provider,
    providerPaymentId: null,
    createdAt: now,
  };
}

export function confirmPaymentAndActivate(
  paymentId: number,
  userId: number,
  planId: string,
  paymentKey: string,
): { payment: Payment; subscription: { id: number; plan: string; status: string; startDate: string; endDate: string } } {
  const db = getDatabase();

  const row = db.prepare(
    'SELECT id, user_id, amount, status, provider, provider_payment_id, created_at FROM payments WHERE id = ?',
  ).get(paymentId) as {
    id: number;
    user_id: number;
    amount: number;
    status: string;
    provider: string;
    provider_payment_id: string | null;
    created_at: string;
  } | undefined;

  if (!row || row.user_id !== userId) {
    throw new Error('PAYMENT_NOT_FOUND');
  }

  if (row.status !== 'pending') {
    throw new Error('PAYMENT_ALREADY_PROCESSED');
  }

  const durationMonths = planId === 'yearly' ? 12 : 1;
  const now = new Date();
  const startDate = now.toISOString();
  const endDate = new Date(now);
  endDate.setMonth(endDate.getMonth() + durationMonths);

  // 결제 확인 + 구독 생성을 트랜잭션으로 묶음
  const activate = db.transaction(() => {
    db.prepare(
      "UPDATE payments SET status = 'completed', provider_payment_id = ? WHERE id = ?",
    ).run(paymentKey, paymentId);

    const subResult = db.prepare(
      `INSERT INTO subscriptions (user_id, plan, status, start_date, end_date, created_at)
       VALUES (?, ?, 'active', ?, ?, ?)`,
    ).run(userId, planId, startDate, endDate.toISOString(), startDate);

    return subResult;
  });

  const subResult = activate();

  return {
    payment: {
      id: paymentId,
      userId,
      amount: row.amount,
      status: 'completed',
      provider: row.provider,
      providerPaymentId: paymentKey,
      createdAt: row.created_at,
    },
    subscription: {
      id: subResult.lastInsertRowid as number,
      plan: planId,
      status: 'active',
      startDate,
      endDate: endDate.toISOString(),
    },
  };
}

export function getPaymentsByUser(userId: number): Payment[] {
  const db = getDatabase();
  const rows = db.prepare(
    'SELECT id, user_id, amount, status, provider, provider_payment_id, created_at FROM payments WHERE user_id = ? ORDER BY created_at DESC',
  ).all(userId) as {
    id: number;
    user_id: number;
    amount: number;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    provider: string;
    provider_payment_id: string | null;
    created_at: string;
  }[];

  return rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    amount: row.amount,
    status: row.status,
    provider: row.provider,
    providerPaymentId: row.provider_payment_id,
    createdAt: row.created_at,
  }));
}
