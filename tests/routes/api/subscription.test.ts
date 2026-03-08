import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';

vi.mock('@/services/subscription.js', () => ({
  getPlans: vi.fn(),
  subscribe: vi.fn(),
  hasActiveSubscription: vi.fn(),
  getUserSubscription: vi.fn(),
  cancelSubscription: vi.fn(),
}));

vi.mock('@/services/payment.js', () => {
  class MockPaymentGateway {
    async createPayment(_amount: number, orderId: string) {
      return { success: true, paymentKey: 'mock-pk', orderId };
    }
    async confirmPayment(paymentKey: string, _orderId: string, _amount: number) {
      return { success: true, paymentKey, approvedAt: new Date().toISOString() };
    }
  }
  return {
    MockPaymentGateway,
    createPaymentRecord: vi.fn(),
    confirmPaymentAndActivate: vi.fn(),
    getPaymentsByUser: vi.fn(),
  };
});

import subscriptionApi from '@/routes/api/subscription.js';
import { getPlans, subscribe, getUserSubscription, cancelSubscription } from '@/services/subscription.js';
import { createPaymentRecord, confirmPaymentAndActivate } from '@/services/payment.js';

const mockGetPlans = vi.mocked(getPlans);
const mockSubscribe = vi.mocked(subscribe);
const mockGetUserSubscription = vi.mocked(getUserSubscription);
const mockCancelSubscription = vi.mocked(cancelSubscription);
const mockCreatePaymentRecord = vi.mocked(createPaymentRecord);
const mockConfirmPaymentAndActivate = vi.mocked(confirmPaymentAndActivate);

function createApp(authenticated = false) {
  const app = new Hono();
  if (authenticated) {
    app.use('*', async (c, next) => {
      c.set('user', { userId: 42, email: 'test@test.com' });
      await next();
    });
  }
  app.route('/api', subscriptionApi);
  return app;
}

describe('subscription API 라우트', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/v1/subscription/plans', () => {
    it('플랜 목록을 반환한다', async () => {
      mockGetPlans.mockReturnValue([
        { id: 'monthly', name: '월간 구독', price: 9900, durationMonths: 1 },
        { id: 'yearly', name: '연간 구독', price: 99000, durationMonths: 12 },
      ]);

      const app = createApp();
      const res = await app.request('/api/v1/subscription/plans');

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.plans).toHaveLength(2);
    });
  });

  describe('POST /api/v1/subscription/subscribe', () => {
    it('인증 없이 요청하면 401을 반환한다', async () => {
      const app = createApp(false);
      const res = await app.request('/api/v1/subscription/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: 'monthly' }),
      });

      expect(res.status).toBe(401);
    });

    it('구독을 생성하고 결제 레코드를 반환한다', async () => {
      mockCreatePaymentRecord.mockReturnValue({
        id: 1,
        userId: 42,
        amount: 9900,
        status: 'pending',
        provider: 'toss',
        providerPaymentId: null,
        createdAt: new Date().toISOString(),
      });

      const app = createApp(true);
      const res = await app.request('/api/v1/subscription/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: 'monthly', provider: 'toss' }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.payment).toBeDefined();
      expect(body.paymentKey).toBeDefined();
    });

    it('planId가 없으면 400을 반환한다', async () => {
      const app = createApp(true);
      const res = await app.request('/api/v1/subscription/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/v1/subscription/confirm', () => {
    it('결제를 확인하고 구독을 활성화한다', async () => {
      const now = new Date().toISOString();
      mockConfirmPaymentAndActivate.mockReturnValue({
        payment: {
          id: 1, userId: 42, amount: 9900, status: 'completed',
          provider: 'toss', providerPaymentId: 'pk-123', createdAt: now,
        },
        subscription: {
          id: 1, plan: 'monthly', status: 'active',
          startDate: now, endDate: now,
        },
      });

      const app = createApp(true);
      const res = await app.request('/api/v1/subscription/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: 1, planId: 'monthly', paymentKey: 'pk-123' }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.payment.status).toBe('completed');
      expect(body.subscription.status).toBe('active');
    });

    it('인증 없이 요청하면 401을 반환한다', async () => {
      const app = createApp(false);
      const res = await app.request('/api/v1/subscription/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: 1, planId: 'monthly', paymentKey: 'pk-123' }),
      });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/subscription/status', () => {
    it('구독 상태를 반환한다', async () => {
      const now = new Date().toISOString();
      mockGetUserSubscription.mockReturnValue({
        id: 1, userId: 42, plan: 'monthly', status: 'active',
        startDate: now, endDate: now, createdAt: now,
      });

      const app = createApp(true);
      const res = await app.request('/api/v1/subscription/status');

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.subscription.plan).toBe('monthly');
    });

    it('구독이 없으면 null을 반환한다', async () => {
      mockGetUserSubscription.mockReturnValue(null);

      const app = createApp(true);
      const res = await app.request('/api/v1/subscription/status');

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.subscription).toBeNull();
    });

    it('인증 없이 요청하면 401을 반환한다', async () => {
      const app = createApp(false);
      const res = await app.request('/api/v1/subscription/status');

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/v1/subscription/cancel', () => {
    it('구독을 취소한다', async () => {
      mockCancelSubscription.mockReturnValue(undefined);

      const app = createApp(true);
      const res = await app.request('/api/v1/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: 1 }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.message).toBeTruthy();
    });

    it('인증 없이 요청하면 401을 반환한다', async () => {
      const app = createApp(false);
      const res = await app.request('/api/v1/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: 1 }),
      });

      expect(res.status).toBe(401);
    });

    it('구독을 찾을 수 없으면 404를 반환한다', async () => {
      mockCancelSubscription.mockImplementation(() => {
        throw new Error('SUBSCRIPTION_NOT_FOUND');
      });

      const app = createApp(true);
      const res = await app.request('/api/v1/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: 999 }),
      });

      expect(res.status).toBe(404);
    });
  });
});
