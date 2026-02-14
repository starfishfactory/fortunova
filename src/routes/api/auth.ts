import { Hono } from 'hono';
import { setCookie, deleteCookie } from 'hono/cookie';
import { register, login } from '@/services/auth.js';
import { ErrorCodes } from '@/errors.js';

const auth = new Hono();

auth.post('/auth/register', async (c) => {
  const body = await c.req.json();

  const { email, password, gender, birthYear, birthMonth, birthDay, birthHour, isLunar, isLeapMonth } = body;

  if (!email || !password || !gender || !birthYear || !birthMonth || !birthDay) {
    return c.json(ErrorCodes.VALIDATION_ERROR, 400);
  }

  if (password.length < 8) {
    return c.json({ ...ErrorCodes.VALIDATION_ERROR, message: '비밀번호는 8자 이상이어야 합니다' }, 400);
  }

  try {
    const result = await register({
      email,
      password,
      gender,
      birthYear: Number(birthYear),
      birthMonth: Number(birthMonth),
      birthDay: Number(birthDay),
      birthHour: birthHour != null ? Number(birthHour) : undefined,
      isLunar: !!isLunar,
      isLeapMonth: !!isLeapMonth,
    });

    setCookie(c, 'token', result.token, {
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
      path: '/',
      maxAge: 86400,
    });

    return c.json({ user: result.user }, 201);
  } catch (e) {
    const msg = (e as Error).message;
    if (msg === 'EMAIL_ALREADY_EXISTS') {
      return c.json(ErrorCodes.EMAIL_ALREADY_EXISTS, 409);
    }
    throw e;
  }
});

auth.post('/auth/login', async (c) => {
  const body = await c.req.json();
  const { email, password } = body;

  if (!email || !password) {
    return c.json(ErrorCodes.VALIDATION_ERROR, 400);
  }

  try {
    const result = await login({ email, password });

    setCookie(c, 'token', result.token, {
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
      path: '/',
      maxAge: 86400,
    });

    return c.json({ user: result.user });
  } catch (e) {
    const msg = (e as Error).message;
    if (msg === 'INVALID_CREDENTIALS') {
      return c.json(ErrorCodes.INVALID_CREDENTIALS, 401);
    }
    throw e;
  }
});

auth.post('/auth/logout', (c) => {
  deleteCookie(c, 'token', { path: '/' });
  return c.json({ message: '로그아웃 되었습니다' });
});

export default auth;
