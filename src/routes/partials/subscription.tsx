import { Hono } from 'hono';
import type { AppEnv } from '@/types/hono.js';
import { checkSubscription, createSubscription, cancelSubscription } from '@/services/subscription.js';
import { processPayment } from '@/services/payment.js';

const subscriptionPartials = new Hono<AppEnv>();

subscriptionPartials.post('/subscription/subscribe', async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.html(
      <div class="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
        <p class="text-red-700 text-sm">
          로그인이 필요합니다. <a href="/login" class="underline">로그인하기</a>
        </p>
      </div>,
    );
  }

  const body = await c.req.parseBody();
  const plan = body['plan'] as string;

  if (!plan || !['monthly', 'yearly'].includes(plan)) {
    return c.html(
      <div class="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
        <p class="text-red-700 text-sm">유효하지 않은 플랜입니다</p>
      </div>,
    );
  }

  const existingSub = checkSubscription(user.userId);
  if (existingSub) {
    return c.html(
      <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2">
        <p class="text-amber-700 text-sm">이미 활성 구독이 있습니다</p>
      </div>,
    );
  }

  const amount = plan === 'monthly' ? 9900 : 99000;
  processPayment(user.userId, amount);
  const sub = createSubscription(user.userId, plan as 'monthly' | 'yearly');

  return c.html(
    <div class="bg-green-50 border border-green-200 rounded-lg p-4 mt-2">
      <h3 class="font-bold text-green-800 mb-1">구독 완료!</h3>
      <p class="text-green-700 text-sm">
        {plan === 'monthly' ? '월간' : '연간'} 구독이 활성화되었습니다.
        만료일: {sub.endDate}
      </p>
      <a href="/" class="inline-block mt-2 text-green-600 text-sm underline">
        운세 보러 가기
      </a>
    </div>,
  );
});

subscriptionPartials.post('/subscription/cancel', (c) => {
  const user = c.get('user');
  if (!user) {
    return c.html(
      <div class="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
        <p class="text-red-700 text-sm">로그인이 필요합니다</p>
      </div>,
    );
  }

  const cancelled = cancelSubscription(user.userId);
  if (!cancelled) {
    return c.html(
      <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2">
        <p class="text-amber-700 text-sm">활성 구독이 없습니다</p>
      </div>,
    );
  }

  return c.html(
    <div class="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
      <p class="text-green-700 text-sm">구독이 취소되었습니다</p>
    </div>,
  );
});

export default subscriptionPartials;
