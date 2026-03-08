import { Hono } from 'hono';
import type { AppEnv } from '@/types/hono.js';
import { getPlans, getUserSubscription, cancelSubscription } from '@/services/subscription.js';
import { MockPaymentGateway, createPaymentRecord, confirmPaymentAndActivate } from '@/services/payment.js';

const subscription = new Hono<AppEnv>();
const gateway = new MockPaymentGateway();

// GET /api/v1/subscription/plans - 플랜 목록 (인증 불필요)
subscription.get('/v1/subscription/plans', (c) => {
  const plans = getPlans();
  return c.json({ plans });
});

// POST /api/v1/subscription/subscribe - 구독 시작 + 결제 (인증 필요)
subscription.post('/v1/subscription/subscribe', async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ code: 'UNAUTHORIZED', message: '인증이 필요합니다' }, 401);
  }

  const body = await c.req.json();
  const { planId, provider } = body;

  if (!planId || !['monthly', 'yearly'].includes(planId)) {
    return c.json({ code: 'VALIDATION_ERROR', message: '올바른 플랜을 선택해주세요' }, 400);
  }

  const plans = getPlans();
  const plan = plans.find((p) => p.id === planId)!;
  const paymentProvider = provider || 'toss';

  const payment = createPaymentRecord(user.userId, plan.price, paymentProvider);
  const orderId = `order_${payment.id}_${Date.now()}`;
  const pgResult = await gateway.createPayment(plan.price, orderId);

  return c.json({
    payment,
    paymentKey: pgResult.paymentKey,
    orderId: pgResult.orderId,
  });
});

// POST /api/v1/subscription/confirm - 결제 확인 + 구독 활성화 (인증 필요)
subscription.post('/v1/subscription/confirm', async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ code: 'UNAUTHORIZED', message: '인증이 필요합니다' }, 401);
  }

  const body = await c.req.json();
  const { paymentId, planId, paymentKey } = body;

  if (!paymentId || !planId || !paymentKey) {
    return c.json({ code: 'VALIDATION_ERROR', message: '필수 값이 누락되었습니다' }, 400);
  }

  try {
    const result = confirmPaymentAndActivate(paymentId, user.userId, planId, paymentKey);
    return c.json(result);
  } catch (e) {
    const msg = (e as Error).message;
    if (msg === 'PAYMENT_NOT_FOUND') {
      return c.json({ code: 'PAYMENT_NOT_FOUND', message: '결제를 찾을 수 없습니다' }, 404);
    }
    if (msg === 'PAYMENT_ALREADY_PROCESSED') {
      return c.json({ code: 'PAYMENT_ALREADY_PROCESSED', message: '이미 처리된 결제입니다' }, 409);
    }
    throw e;
  }
});

// GET /api/v1/subscription/status - 내 구독 상태 (인증 필요)
subscription.get('/v1/subscription/status', (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ code: 'UNAUTHORIZED', message: '인증이 필요합니다' }, 401);
  }

  const sub = getUserSubscription(user.userId);
  return c.json({ subscription: sub });
});

// POST /api/v1/subscription/cancel - 구독 취소 (인증 필요)
subscription.post('/v1/subscription/cancel', async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ code: 'UNAUTHORIZED', message: '인증이 필요합니다' }, 401);
  }

  const body = await c.req.json();
  const { subscriptionId } = body;

  try {
    cancelSubscription(subscriptionId, user.userId);
    return c.json({ message: '구독이 취소되었습니다' });
  } catch (e) {
    const msg = (e as Error).message;
    if (msg === 'SUBSCRIPTION_NOT_FOUND') {
      return c.json({ code: 'SUBSCRIPTION_NOT_FOUND', message: '구독을 찾을 수 없습니다' }, 404);
    }
    if (msg === 'ALREADY_CANCELLED') {
      return c.json({ code: 'ALREADY_CANCELLED', message: '이미 취소된 구독입니다' }, 409);
    }
    throw e;
  }
});

export default subscription;
