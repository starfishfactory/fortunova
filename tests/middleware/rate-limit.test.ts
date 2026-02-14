import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';

vi.mock('@/db/connection.js', () => ({
  getDatabase: vi.fn(),
}));

import { rateLimitMiddleware, getRequestIdentifier } from '@/middleware/rate-limit.js';
import { getDatabase } from '@/db/connection.js';

const mockGetDatabase = vi.mocked(getDatabase);

function createMockDb() {
  const mockGet = vi.fn();
  const mockPrepare = vi.fn().mockReturnValue({ get: mockGet });
  return { prepare: mockPrepare, _get: mockGet };
}

describe('rate-limit 미들웨어', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getRequestIdentifier', () => {
    it('인증된 사용자는 userId 기반 식별자를 반환한다', async () => {
      const app = new Hono();
      app.use('*', async (c, next) => {
        c.set('user', { userId: 42, email: 'test@test.com' });
        await next();
      });
      app.get('/test', (c) => {
        const result = getRequestIdentifier(c);
        return c.json(result);
      });

      const res = await app.request('/test');
      const body = await res.json();

      expect(body.identifier).toBe('user:42');
      expect(body.identifierType).toBe('user');
    });

    it('비인증 사용자는 IP+UA 해시 기반 식별자를 반환한다', async () => {
      const app = new Hono();
      app.get('/test', (c) => {
        const result = getRequestIdentifier(c);
        return c.json(result);
      });

      const res = await app.request('/test', {
        headers: {
          'x-forwarded-for': '1.2.3.4',
          'user-agent': 'TestBrowser',
        },
      });
      const body = await res.json();

      expect(body.identifier).toMatch(/^anon:[a-f0-9]{64}$/);
      expect(body.identifierType).toBe('anonymous');
    });
  });

  describe('rateLimitMiddleware', () => {
    it('사용량이 한도 미만이면 통과시킨다', async () => {
      const mockDb = createMockDb();
      mockDb._get.mockReturnValue({ count: 1 });
      mockGetDatabase.mockReturnValue(mockDb as any);

      const app = new Hono();
      app.use('*', rateLimitMiddleware);
      app.get('/test', (c) => c.json({ ok: true }));

      const res = await app.request('/test');

      expect(res.status).toBe(200);
    });

    it('사용량이 한도에 도달하면 429를 반환한다', async () => {
      const mockDb = createMockDb();
      mockDb._get.mockReturnValue({ count: 3 });
      mockGetDatabase.mockReturnValue(mockDb as any);

      const app = new Hono();
      app.use('*', rateLimitMiddleware);
      app.get('/test', (c) => c.json({ ok: true }));

      const res = await app.request('/test');

      expect(res.status).toBe(429);
      const body = await res.json();
      expect(body.code).toBe('DAILY_LIMIT_EXCEEDED');
    });

    it('사용 기록이 없으면 통과시킨다', async () => {
      const mockDb = createMockDb();
      mockDb._get.mockReturnValue(undefined);
      mockGetDatabase.mockReturnValue(mockDb as any);

      const app = new Hono();
      app.use('*', rateLimitMiddleware);
      app.get('/test', (c) => c.json({ ok: true }));

      const res = await app.request('/test');

      expect(res.status).toBe(200);
    });

    it('identifier와 identifierType을 context에 설정한다', async () => {
      const mockDb = createMockDb();
      mockDb._get.mockReturnValue(undefined);
      mockGetDatabase.mockReturnValue(mockDb as any);

      const app = new Hono();
      app.use('*', rateLimitMiddleware);
      app.get('/test', (c) => {
        const identifier = c.get('identifier');
        const identifierType = c.get('identifierType');
        return c.json({ identifier, identifierType });
      });

      const res = await app.request('/test');
      const body = await res.json();

      expect(body.identifier).toBeTruthy();
      expect(body.identifierType).toBe('anonymous');
    });
  });
});
