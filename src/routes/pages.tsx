import { Hono } from 'hono';
import type { Context } from 'hono';
import type { AppEnv } from '@/types/hono.js';
import { config } from '@/config.js';
import { Layout } from '../views/layout.js';
import type { LayoutProps } from '../views/layout.js';
import { HomePage } from '../views/home.js';
import { LoginPage } from '../views/login.js';
import { RegisterPage } from '../views/register.js';
import { MypagePage } from '../views/mypage.js';
import { SubscribePage } from '../views/subscribe.js';
import { getPlans, getUserSubscription, hasActiveSubscription } from '../services/subscription.js';
import { getDatabase } from '../db/connection.js';

/** 공통: user/잔여횟수/구독 정보를 Layout props로 추출 */
function getLayoutContext(c: Context<AppEnv>): Pick<LayoutProps, 'user' | 'remainingCount' | 'isSubscriber'> {
  const authUser = c.get('user') as { userId: number; email: string } | undefined;
  if (!authUser) return {};

  const db = getDatabase();
  const date = new Date().toISOString().slice(0, 10);
  const identifier = `user:${authUser.userId}`;
  const usage = db.prepare(
    'SELECT count FROM daily_usage WHERE identifier = ? AND date = ?',
  ).get(identifier, date) as { count: number } | undefined;
  const usedCount = usage?.count ?? 0;
  const subscriber = hasActiveSubscription(authUser.userId);

  return {
    user: { email: authUser.email },
    remainingCount: Math.max(0, config.dailyFreeLimit - usedCount),
    isSubscriber: subscriber,
  };
}

const pages = new Hono<AppEnv>();

pages.get('/', (c) => {
  return c.html(
    <Layout {...getLayoutContext(c)}>
      <HomePage />
    </Layout>,
  );
});

pages.get('/login', (c) => {
  return c.html(
    <Layout title="로그인" {...getLayoutContext(c)}>
      <LoginPage />
    </Layout>,
  );
});

pages.get('/register', (c) => {
  return c.html(
    <Layout title="회원가입" {...getLayoutContext(c)}>
      <RegisterPage />
    </Layout>,
  );
});

pages.get('/mypage', (c) => {
  const user = c.get('user') as { userId: number; email: string } | undefined;
  if (!user) {
    return c.redirect('/login');
  }

  const db = getDatabase();
  const row = db.prepare(
    'SELECT birth_year, birth_month, birth_day FROM users WHERE id = ?',
  ).get(user.userId) as { birth_year: number; birth_month: number; birth_day: number } | undefined;

  const subscription = getUserSubscription(user.userId);

  return c.html(
    <Layout title="마이페이지" {...getLayoutContext(c)}>
      <MypagePage
        email={user.email}
        birthYear={row?.birth_year ?? 0}
        birthMonth={row?.birth_month ?? 0}
        birthDay={row?.birth_day ?? 0}
        subscription={subscription}
      />
    </Layout>,
  );
});

pages.get('/subscribe', (c) => {
  const user = c.get('user') as { userId: number; email: string } | undefined;
  const plans = getPlans();

  return c.html(
    <Layout title="구독 안내" {...getLayoutContext(c)}>
      <SubscribePage plans={plans} isAuthenticated={!!user} />
    </Layout>,
  );
});

export default pages;
