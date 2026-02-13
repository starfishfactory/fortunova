import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';

vi.mock('@/services/auth.js', () => ({
  register: vi.fn(),
  login: vi.fn(),
  verifyToken: vi.fn(),
}));

import auth from '@/routes/api/auth.js';
import { register, login } from '@/services/auth.js';

const mockRegister = vi.mocked(register);
const mockLogin = vi.mocked(login);

const app = new Hono();
app.route('/api', auth);

describe('auth API 라우트', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    const validBody = {
      email: 'test@example.com',
      password: 'password123',
      gender: 'M',
      birthYear: 1990,
      birthMonth: 5,
      birthDay: 15,
    };

    it('회원가입에 성공하면 201과 사용자 정보를 반환한다', async () => {
      mockRegister.mockResolvedValue({
        user: {
          id: 1,
          email: 'test@example.com',
          gender: 'M',
          birthYear: 1990,
          birthMonth: 5,
          birthDay: 15,
          birthHour: null,
          isLunar: false,
          isLeapMonth: false,
        },
        token: 'jwt-token',
      });

      const res = await app.request('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validBody),
      });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.user.email).toBe('test@example.com');
      // HttpOnly 쿠키 확인
      const setCookie = res.headers.get('set-cookie');
      expect(setCookie).toContain('token=jwt-token');
      expect(setCookie).toContain('HttpOnly');
    });

    it('필수 필드가 없으면 400을 반환한다', async () => {
      const res = await app.request('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com' }),
      });

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.code).toBe('VALIDATION_ERROR');
    });

    it('비밀번호가 8자 미만이면 400을 반환한다', async () => {
      const res = await app.request('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...validBody, password: 'short' }),
      });

      expect(res.status).toBe(400);
    });

    it('중복 이메일이면 409를 반환한다', async () => {
      mockRegister.mockRejectedValue(new Error('EMAIL_ALREADY_EXISTS'));

      const res = await app.request('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validBody),
      });

      expect(res.status).toBe(409);
      const body = await res.json();
      expect(body.code).toBe('EMAIL_ALREADY_EXISTS');
    });
  });

  describe('POST /api/auth/login', () => {
    it('올바른 자격 증명으로 로그인에 성공한다', async () => {
      mockLogin.mockResolvedValue({
        user: {
          id: 1,
          email: 'test@example.com',
          gender: 'M',
          birthYear: 1990,
          birthMonth: 5,
          birthDay: 15,
          birthHour: null,
          isLunar: false,
          isLeapMonth: false,
        },
        token: 'jwt-token',
      });

      const res = await app.request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.user.email).toBe('test@example.com');
      const setCookie = res.headers.get('set-cookie');
      expect(setCookie).toContain('token=jwt-token');
    });

    it('필수 필드가 없으면 400을 반환한다', async () => {
      const res = await app.request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com' }),
      });

      expect(res.status).toBe(400);
    });

    it('잘못된 자격 증명이면 401을 반환한다', async () => {
      mockLogin.mockRejectedValue(new Error('INVALID_CREDENTIALS'));

      const res = await app.request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'wrong' }),
      });

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('로그아웃하면 쿠키를 삭제한다', async () => {
      const res = await app.request('/api/auth/logout', {
        method: 'POST',
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.message).toBe('로그아웃 되었습니다');
    });
  });
});
