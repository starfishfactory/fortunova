import type { Context, Next } from 'hono';
import { getCookie } from 'hono/cookie';
import { verifyToken } from '@/services/auth.js';

export async function optionalAuth(c: Context, next: Next) {
  const token = getCookie(c, 'token');
  if (token) {
    try {
      const user = await verifyToken(token);
      c.set('user', user);
    } catch {
      // invalid token - continue as anonymous
    }
  }
  await next();
}

export async function requireAuth(c: Context, next: Next) {
  const token = getCookie(c, 'token');
  if (!token) {
    return c.json({ code: 'UNAUTHORIZED', message: '인증이 필요합니다' }, 401);
  }
  try {
    const user = await verifyToken(token);
    c.set('user', user);
    await next();
  } catch {
    return c.json({ code: 'UNAUTHORIZED', message: '인증이 필요합니다' }, 401);
  }
}
