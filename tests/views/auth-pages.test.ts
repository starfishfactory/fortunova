import { describe, it, expect, vi } from 'vitest';
import { Hono } from 'hono';

vi.mock('@/services/auth.js', () => ({
  verifyToken: vi.fn(),
}));

vi.mock('@/db/connection.js', () => ({
  getDatabase: vi.fn(),
}));

import pages from '@/routes/pages.js';

const app = new Hono();
app.route('/', pages);

describe('인증 페이지', () => {
  it('GET /login이 로그인 폼을 렌더링한다', async () => {
    const res = await app.request('/login');

    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/html');
    const html = await res.text();
    expect(html).toContain('로그인');
    expect(html).toContain('email');
    expect(html).toContain('password');
  });

  it('GET /register가 회원가입 폼을 렌더링한다', async () => {
    const res = await app.request('/register');

    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/html');
    const html = await res.text();
    expect(html).toContain('회원가입');
    expect(html).toContain('birthYear');
    expect(html).toContain('gender');
  });

  it('로그인 페이지에 회원가입 링크가 있다', async () => {
    const res = await app.request('/login');
    const html = await res.text();

    expect(html).toContain('/register');
  });

  it('회원가입 페이지에 로그인 링크가 있다', async () => {
    const res = await app.request('/register');
    const html = await res.text();

    expect(html).toContain('/login');
  });
});
