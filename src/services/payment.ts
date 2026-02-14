import { getDatabase } from '@/db/connection.js';

export interface PaymentResult {
  id: number;
  userId: number;
  amount: number;
  status: 'completed' | 'failed';
  provider: 'toss' | 'kakao';
  providerPaymentId: string;
  createdAt: string;
}

/**
 * Mock 결제 처리 (항상 성공)
 */
export function processPayment(
  userId: number,
  amount: number,
  provider: 'toss' | 'kakao' = 'toss',
): PaymentResult {
  const db = getDatabase();
  const now = new Date().toISOString();
  const providerPaymentId = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const result = db.prepare(
    `INSERT INTO payments (user_id, amount, status, provider, provider_payment_id, created_at)
     VALUES (?, ?, 'completed', ?, ?, ?)`,
  ).run(userId, amount, provider, providerPaymentId, now);

  return {
    id: result.lastInsertRowid as number,
    userId,
    amount,
    status: 'completed',
    provider,
    providerPaymentId,
    createdAt: now,
  };
}

/**
 * Mock 결제 검증 (항상 성공)
 */
export function verifyPayment(paymentId: number): boolean {
  const db = getDatabase();

  const row = db.prepare(
    'SELECT status FROM payments WHERE id = ?',
  ).get(paymentId) as { status: string } | undefined;

  return row?.status === 'completed';
}
