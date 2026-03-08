import type { Context, Next } from 'hono';
import { createHash } from 'crypto';
import { getDatabase } from '@/db/connection.js';
import { config } from '@/config.js';
import { hasActiveSubscription } from '@/services/subscription.js';

export function getRequestIdentifier(c: Context): { identifier: string; identifierType: 'user' | 'anonymous' } {
  const user = c.get('user') as { userId: number } | undefined;
  if (user) {
    return { identifier: `user:${user.userId}`, identifierType: 'user' };
  }

  const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || '127.0.0.1';
  const ua = c.req.header('user-agent') || '';
  const hash = createHash('sha256').update(`${ip}:${ua}`).digest('hex');
  return { identifier: `anon:${hash}`, identifierType: 'anonymous' };
}

export async function rateLimitMiddleware(c: Context, next: Next) {
  const { identifier, identifierType } = getRequestIdentifier(c);
  const db = getDatabase();
  const date = new Date().toISOString().slice(0, 10);

  const usage = db.prepare(
    'SELECT count FROM daily_usage WHERE identifier = ? AND date = ?',
  ).get(identifier, date) as { count: number } | undefined;

  const currentCount = usage?.count ?? 0;

  // 구독자 우회: 활성 구독이 있으면 rate-limit 건너뜀
  if (identifierType === 'user') {
    const userId = parseInt(identifier.split(':')[1]);
    if (hasActiveSubscription(userId)) {
      c.set('identifier', identifier);
      c.set('identifierType', identifierType);
      c.set('isSubscriber', true);
      await next();
      return;
    }
  }

  if (currentCount >= config.dailyFreeLimit) {
    return c.json({
      code: 'DAILY_LIMIT_EXCEEDED',
      message: '일일 무료 3회 초과',
      remainingFreeCount: 0,
    }, 429);
  }

  c.set('identifier', identifier);
  c.set('identifierType', identifierType);

  await next();
}
