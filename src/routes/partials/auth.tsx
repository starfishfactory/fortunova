import { Hono } from 'hono';
import { setCookie } from 'hono/cookie';
import { register, login } from '@/services/auth.js';

const authPartials = new Hono();

authPartials.post('/auth/login', async (c) => {
  const body = await c.req.parseBody();
  const email = body['email'] as string;
  const password = body['password'] as string;

  if (!email || !password) {
    return c.html(
      <div class="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
        <p class="text-red-700 text-sm">이메일과 비밀번호를 입력해주세요</p>
      </div>,
    );
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

    c.header('HX-Redirect', '/');
    return c.html(<div></div>);
  } catch (e) {
    const msg = (e as Error).message;
    if (msg === 'INVALID_CREDENTIALS') {
      return c.html(
        <div class="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
          <p class="text-red-700 text-sm">이메일 또는 비밀번호가 올바르지 않습니다</p>
        </div>,
      );
    }
    return c.html(
      <div class="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
        <p class="text-red-700 text-sm">로그인 처리 중 오류가 발생했습니다</p>
      </div>,
    );
  }
});

authPartials.post('/auth/register', async (c) => {
  const body = await c.req.parseBody();
  const email = body['email'] as string;
  const password = body['password'] as string;
  const gender = body['gender'] as string;
  const birthYear = body['birthYear'] as string;
  const birthMonth = body['birthMonth'] as string;
  const birthDay = body['birthDay'] as string;
  const birthHour = body['birthHour'] as string;
  const isLunar = body['isLunar'] as string;

  if (!email || !password || !gender || !birthYear || !birthMonth || !birthDay) {
    return c.html(
      <div class="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
        <p class="text-red-700 text-sm">모든 필수 항목을 입력해주세요</p>
      </div>,
    );
  }

  if (password.length < 8) {
    return c.html(
      <div class="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
        <p class="text-red-700 text-sm">비밀번호는 8자 이상이어야 합니다</p>
      </div>,
    );
  }

  try {
    const result = await register({
      email,
      password,
      gender: gender as 'M' | 'F',
      birthYear: Number(birthYear),
      birthMonth: Number(birthMonth),
      birthDay: Number(birthDay),
      birthHour: birthHour ? Number(birthHour) : undefined,
      isLunar: isLunar === 'true',
    });

    setCookie(c, 'token', result.token, {
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
      path: '/',
      maxAge: 86400,
    });

    c.header('HX-Redirect', '/');
    return c.html(<div></div>);
  } catch (e) {
    const msg = (e as Error).message;
    if (msg === 'EMAIL_ALREADY_EXISTS') {
      return c.html(
        <div class="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
          <p class="text-red-700 text-sm">이미 등록된 이메일입니다</p>
        </div>,
      );
    }
    return c.html(
      <div class="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
        <p class="text-red-700 text-sm">회원가입 처리 중 오류가 발생했습니다</p>
      </div>,
    );
  }
});

export default authPartials;
