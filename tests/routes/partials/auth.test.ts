import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';

vi.mock('@/services/auth.js', () => ({
  register: vi.fn(),
  login: vi.fn(),
}));

import authPartials from '@/routes/partials/auth.js';
import { register, login } from '@/services/auth.js';

const mockRegister = vi.mocked(register);
const mockLogin = vi.mocked(login);

const app = new Hono();
app.route('/partials', authPartials);

function formBody(data: Record<string, string>): URLSearchParams {
  return new URLSearchParams(data);
}

describe('authPartials 라우트', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /partials/auth/login', () => {
    it('필수 필드 누락 시 에러 HTML을 반환한다', async () => {
      const res = await app.request('/partials/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody({ email: 'test@example.com' }),
      });

      const html = await res.text();
      expect(html).toContain('이메일과 비밀번호를 입력해주세요');
    });

    it('성공 시 HX-Redirect 헤더를 설정한다', async () => {
      mockLogin.mockResolvedValue({
        user: {
          id: 1, email: 'test@example.com', gender: 'M',
          birthYear: 1990, birthMonth: 5, birthDay: 15,
          birthHour: null, isLunar: false, isLeapMonth: false,
        },
        token: 'jwt-token',
      });

      const res = await app.request('/partials/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody({ email: 'test@example.com', password: 'password123' }),
      });

      expect(res.headers.get('HX-Redirect')).toBe('/');
    });

    it('INVALID_CREDENTIALS 시 에러 메시지를 반환한다', async () => {
      mockLogin.mockRejectedValue(new Error('INVALID_CREDENTIALS'));

      const res = await app.request('/partials/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody({ email: 'test@example.com', password: 'wrong' }),
      });

      const html = await res.text();
      expect(html).toContain('이메일 또는 비밀번호가 올바르지 않습니다');
    });

    it('기타 에러 시 일반 에러 메시지를 반환한다', async () => {
      mockLogin.mockRejectedValue(new Error('UNKNOWN_ERROR'));

      const res = await app.request('/partials/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody({ email: 'test@example.com', password: 'password123' }),
      });

      const html = await res.text();
      expect(html).toContain('로그인 처리 중 오류가 발생했습니다');
    });
  });

  describe('POST /partials/auth/register', () => {
    const validForm = {
      email: 'test@example.com',
      password: 'password123',
      gender: 'M',
      birthYear: '1990',
      birthMonth: '5',
      birthDay: '15',
    };

    it('필수 필드 누락 시 에러 HTML을 반환한다', async () => {
      const res = await app.request('/partials/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody({ email: 'test@example.com' }),
      });

      const html = await res.text();
      expect(html).toContain('모든 필수 항목을 입력해주세요');
    });

    it('비밀번호 8자 미만 시 에러를 반환한다', async () => {
      const res = await app.request('/partials/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody({ ...validForm, password: 'short' }),
      });

      const html = await res.text();
      expect(html).toContain('비밀번호는 8자 이상이어야 합니다');
    });

    it('성공 시 HX-Redirect 헤더를 설정한다', async () => {
      mockRegister.mockResolvedValue({
        user: {
          id: 1, email: 'test@example.com', gender: 'M',
          birthYear: 1990, birthMonth: 5, birthDay: 15,
          birthHour: null, isLunar: false, isLeapMonth: false,
        },
        token: 'jwt-token',
      });

      const res = await app.request('/partials/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody(validForm),
      });

      expect(res.headers.get('HX-Redirect')).toBe('/');
    });

    it('EMAIL_ALREADY_EXISTS 시 에러를 반환한다', async () => {
      mockRegister.mockRejectedValue(new Error('EMAIL_ALREADY_EXISTS'));

      const res = await app.request('/partials/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody(validForm),
      });

      const html = await res.text();
      expect(html).toContain('이미 등록된 이메일입니다');
    });

    it('기타 에러 시 일반 에러 메시지를 반환한다', async () => {
      mockRegister.mockRejectedValue(new Error('UNKNOWN_ERROR'));

      const res = await app.request('/partials/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody(validForm),
      });

      const html = await res.text();
      expect(html).toContain('회원가입 처리 중 오류가 발생했습니다');
    });
  });
});
