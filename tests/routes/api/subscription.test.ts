import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';

vi.mock('@/services/subscription.js', () => ({
  getPlans: vi.fn().mockReturnValue([
    { id: 'monthly', name: '월간 구독', price: 9900, period: '1개월' },
    { id: 'yearly', name: '연간 구독', price: 99000, period: '1년' },
  ]),
  checkSubscription: vi.fn(),
  createSubscription: vi.fn(),
  cancelSubscription: vi.fn(),
}));

vi.mock('@/services/payment.js', () => ({
  processPayment: vi.fn(),
}));

import subscription from '@/routes/api/subscription.js';
import { checkSubscription, createSubscription, cancelSubscription } from '@/services/subscription.js';
import { processPayment } from '@/services/payment.js';

const mockCheckSubscription = vi.mocked(checkSubscription);
const mockCreateSubscription = vi.mocked(createSubscription);
const mockCancelSubscription = vi.mocked(cancelSubscription);
const mockProcessPayment = vi.mocked(processPayment);

function createAuthApp() {
  const app = new Hono();
  app.use('*', async (c, next) => {
    c.set('user', { userId: 1, email: 'test@example.com' });
    await next();
  });
  app.route('/api', subscription);
  return app;
}

function createUnauthApp() {
  const app = new Hono();
  app.route('/api', subscription);
  return app;
}

describe('subscription API 라우트', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/plans', () => {
    it('플랜 목록을 반환한다', async () => {
      const app = createUnauthApp();
      const res = await app.request('/api/plans');

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.plans).toHaveLength(2);
    });
  });

  describe('GET /api/subscription', () => {
    it('인증된 사용자의 구독 상태를 반환한다', async () => {
      mockCheckSubscription.mockReturnValue({
        id: 1, userId: 1, plan: 'monthly', status: 'active',
        startDate: '2026-01-01', endDate: '2026-02-01', createdAt: '2026-01-01',
      });

      const app = createAuthApp();
      const res = await app.request('/api/subscription');

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.subscription.plan).toBe('monthly');
    });

    it('미인증 사용자에게 401을 반환한다', async () => {
      const app = createUnauthApp();
      const res = await app.request('/api/subscription');

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/subscribe', () => {
    it('구독을 생성한다', async () => {
      mockCheckSubscription.mockReturnValue(null);
      mockProcessPayment.mockReturnValue({
        id: 1, userId: 1, amount: 9900, status: 'completed',
        provider: 'toss', providerPaymentId: 'mock_123', createdAt: '2026-01-01',
      });
      mockCreateSubscription.mockReturnValue({
        id: 1, userId: 1, plan: 'monthly', status: 'active',
        startDate: '2026-01-01', endDate: '2026-02-01', createdAt: '2026-01-01',
      });

      const app = createAuthApp();
      const res = await app.request('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'monthly' }),
      });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.subscription.plan).toBe('monthly');
    });

    it('이미 구독 중이면 409를 반환한다', async () => {
      mockCheckSubscription.mockReturnValue({
        id: 1, userId: 1, plan: 'monthly', status: 'active',
        startDate: '2026-01-01', endDate: '2026-02-01', createdAt: '2026-01-01',
      });

      const app = createAuthApp();
      const res = await app.request('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'monthly' }),
      });

      expect(res.status).toBe(409);
    });

    it('유효하지 않은 플랜이면 400을 반환한다', async () => {
      const app = createAuthApp();
      const res = await app.request('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'invalid' }),
      });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/cancel', () => {
    it('구독을 취소한다', async () => {
      mockCancelSubscription.mockReturnValue(true);

      const app = createAuthApp();
      const res = await app.request('/api/cancel', { method: 'POST' });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.message).toContain('취소');
    });

    it('활성 구독이 없으면 404를 반환한다', async () => {
      mockCancelSubscription.mockReturnValue(false);

      const app = createAuthApp();
      const res = await app.request('/api/cancel', { method: 'POST' });

      expect(res.status).toBe(404);
    });
  });
});
