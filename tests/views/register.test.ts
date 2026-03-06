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

describe('RegisterPage', () => {
  let html: string;

  async function getHtml() {
    if (!html) {
      const res = await app.request('/register');
      html = await res.text();
    }
    return html;
  }

  it('회원가입 폼이 렌더링된다', async () => {
    const h = await getHtml();
    expect(h).toContain('<form');
    expect(h).toContain('hx-post="/partials/auth/register"');
  });

  it('이메일 입력 필드가 있다', async () => {
    const h = await getHtml();
    expect(h).toContain('type="email"');
    expect(h).toContain('name="email"');
    expect(h).toContain('required');
  });

  it('비밀번호 입력 필드가 있다', async () => {
    const h = await getHtml();
    expect(h).toContain('type="password"');
    expect(h).toContain('name="password"');
    expect(h).toContain('minLength');
  });

  it('생년월일 필드가 있다', async () => {
    const h = await getHtml();
    expect(h).toContain('name="birthYear"');
    expect(h).toContain('name="birthMonth"');
    expect(h).toContain('name="birthDay"');
  });

  it('출생 시간 필드가 있다', async () => {
    const h = await getHtml();
    expect(h).toContain('name="birthHour"');
  });

  it('성별 라디오 버튼이 있다', async () => {
    const h = await getHtml();
    expect(h).toContain('name="gender"');
    expect(h).toContain('value="M"');
    expect(h).toContain('value="F"');
  });

  it('음력 체크박스가 있다', async () => {
    const h = await getHtml();
    expect(h).toContain('name="isLunar"');
  });

  it('로그인 페이지 링크가 있다', async () => {
    const h = await getHtml();
    expect(h).toContain('href="/login"');
  });

  it('hx-target과 hx-indicator가 설정된다', async () => {
    const h = await getHtml();
    expect(h).toContain('hx-target');
    expect(h).toContain('hx-indicator');
  });
});
