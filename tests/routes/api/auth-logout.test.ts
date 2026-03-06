import { describe, it, expect, vi } from 'vitest';
import { Hono } from 'hono';

vi.mock('@/services/auth.js', () => ({
  register: vi.fn(),
  login: vi.fn(),
}));

import auth from '@/routes/api/auth.js';

const app = new Hono();
app.route('/api', auth);

describe('auth logout API', () => {
  it('POST /api/auth/logout: 성공 메시지를 반환한다', async () => {
    const res = await app.request('/api/auth/logout', { method: 'POST' });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toBe('로그아웃 되었습니다');
  });

  it('POST /api/auth/logout: Set-Cookie 헤더로 token 쿠키를 삭제한다', async () => {
    const res = await app.request('/api/auth/logout', { method: 'POST' });

    const setCookie = res.headers.get('set-cookie');
    expect(setCookie).toContain('token=');
    expect(setCookie).toContain('Max-Age=0');
  });
});
