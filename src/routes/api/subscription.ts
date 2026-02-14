import { Hono } from 'hono';
import type { AppEnv } from '@/types/hono.js';
import { getPlans, checkSubscription, createSubscription, cancelSubscription } from '@/services/subscription.js';
import { processPayment } from '@/services/payment.js';
import { ErrorCodes } from '@/errors.js';

const subscription = new Hono<AppEnv>();

subscription.get('/plans', (c) => {
  const plans = getPlans();
  return c.json({ plans });
});

subscription.get('/subscription', (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json(ErrorCodes.UNAUTHORIZED, 401);
  }

  const sub = checkSubscription(user.userId);
  return c.json({ subscription: sub });
});

subscription.post('/subscribe', async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json(ErrorCodes.UNAUTHORIZED, 401);
  }

  const body = await c.req.json();
  const { plan, provider } = body;

  if (!plan || !['monthly', 'yearly'].includes(plan)) {
    return c.json({ ...ErrorCodes.VALIDATION_ERROR, message: '유효하지 않은 플랜입니다' }, 400);
  }

  const existingSub = checkSubscription(user.userId);
  if (existingSub) {
    return c.json({ code: 'ALREADY_SUBSCRIBED', message: '이미 활성 구독이 있습니다' }, 409);
  }

  const amount = plan === 'monthly' ? 9900 : 99000;
  const payment = processPayment(user.userId, amount, provider || 'toss');

  if (payment.status !== 'completed') {
    return c.json({ code: 'PAYMENT_FAILED', message: '결제에 실패했습니다' }, 402);
  }

  const sub = createSubscription(user.userId, plan);
  return c.json({ subscription: sub, payment }, 201);
});

subscription.post('/cancel', (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json(ErrorCodes.UNAUTHORIZED, 401);
  }

  const cancelled = cancelSubscription(user.userId);
  if (!cancelled) {
    return c.json({ code: 'NO_ACTIVE_SUBSCRIPTION', message: '활성 구독이 없습니다' }, 404);
  }

  return c.json({ message: '구독이 취소되었습니다' });
});

export default subscription;
