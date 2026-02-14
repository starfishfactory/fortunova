import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';

vi.mock('@/services/auth.js', () => ({
  verifyToken: vi.fn(),
}));

import { optionalAuth, requireAuth } from '@/middleware/auth.js';
import { verifyToken } from '@/services/auth.js';

const mockVerifyToken = vi.mocked(verifyToken);

describe('auth 미들웨어', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('optionalAuth', () => {
    it('토큰이 없으면 user 없이 통과한다', async () => {
      const app = new Hono();
      app.use('*', optionalAuth);
      app.get('/test', (c) => {
        const user = c.get('user');
        return c.json({ hasUser: !!user });
      });

      const res = await app.request('/test');
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.hasUser).toBe(false);
    });

    it('유효한 토큰이면 user를 설정한다', async () => {
      mockVerifyToken.mockResolvedValue({ userId: 1, email: 'test@example.com' });

      const app = new Hono();
      app.use('*', optionalAuth);
      app.get('/test', (c) => {
        const user = c.get('user') as any;
        return c.json({ userId: user?.userId, email: user?.email });
      });

      const res = await app.request('/test', {
        headers: { Cookie: 'token=valid-jwt-token' },
      });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.userId).toBe(1);
      expect(body.email).toBe('test@example.com');
    });

    it('유효하지 않은 토큰이면 user 없이 통과한다', async () => {
      mockVerifyToken.mockRejectedValue(new Error('invalid'));

      const app = new Hono();
      app.use('*', optionalAuth);
      app.get('/test', (c) => {
        const user = c.get('user');
        return c.json({ hasUser: !!user });
      });

      const res = await app.request('/test', {
        headers: { Cookie: 'token=invalid-token' },
      });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.hasUser).toBe(false);
    });
  });

  describe('requireAuth', () => {
    it('토큰이 없으면 401을 반환한다', async () => {
      const app = new Hono();
      app.use('*', requireAuth);
      app.get('/test', (c) => c.json({ ok: true }));

      const res = await app.request('/test');

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.code).toBe('UNAUTHORIZED');
    });

    it('유효한 토큰이면 통과한다', async () => {
      mockVerifyToken.mockResolvedValue({ userId: 1, email: 'test@example.com' });

      const app = new Hono();
      app.use('*', requireAuth);
      app.get('/test', (c) => {
        const user = c.get('user') as any;
        return c.json({ userId: user.userId });
      });

      const res = await app.request('/test', {
        headers: { Cookie: 'token=valid-token' },
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.userId).toBe(1);
    });

    it('유효하지 않은 토큰이면 401을 반환한다', async () => {
      mockVerifyToken.mockRejectedValue(new Error('invalid'));

      const app = new Hono();
      app.use('*', requireAuth);
      app.get('/test', (c) => c.json({ ok: true }));

      const res = await app.request('/test', {
        headers: { Cookie: 'token=bad-token' },
      });

      expect(res.status).toBe(401);
    });
  });
});
