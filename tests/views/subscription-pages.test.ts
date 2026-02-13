import { describe, it, expect, vi } from 'vitest';
import { Hono } from 'hono';

vi.mock('@/services/auth.js', () => ({
  verifyToken: vi.fn(),
}));

vi.mock('@/db/connection.js', () => ({
  getDatabase: vi.fn(),
}));

vi.mock('@/services/subscription.js', () => ({
  checkSubscription: vi.fn().mockReturnValue(null),
}));

import pages from '@/routes/pages.js';

const app = new Hono();
app.route('/', pages);

describe('구독 관련 페이지', () => {
  it('GET /subscribe가 구독 페이지를 렌더링한다', async () => {
    const res = await app.request('/subscribe');

    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/html');
    const html = await res.text();
    expect(html).toContain('구독');
    expect(html).toContain('9,900');
  });

  it('GET /mypage가 미인증 시 로그인으로 리다이렉트한다', async () => {
    const res = await app.request('/mypage');

    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe('/login');
  });
});
