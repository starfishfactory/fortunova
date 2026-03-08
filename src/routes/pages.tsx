import { Hono } from 'hono';
import type { AppEnv } from '@/types/hono.js';
import { Layout } from '../views/layout.js';
import { HomePage } from '../views/home.js';
import { LoginPage } from '../views/login.js';
import { RegisterPage } from '../views/register.js';
import { MypagePage } from '../views/mypage.js';
import { SubscribePage } from '../views/subscribe.js';
import { getPlans, getUserSubscription } from '../services/subscription.js';
import { getDatabase } from '../db/connection.js';

const pages = new Hono<AppEnv>();

pages.get('/', (c) => {
  return c.html(
    <Layout>
      <HomePage />
    </Layout>,
  );
});

pages.get('/login', (c) => {
  return c.html(
    <Layout title="로그인">
      <LoginPage />
    </Layout>,
  );
});

pages.get('/register', (c) => {
  return c.html(
    <Layout title="회원가입">
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
    <Layout title="마이페이지">
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
    <Layout title="구독 안내">
      <SubscribePage plans={plans} isAuthenticated={!!user} />
    </Layout>,
  );
});

export default pages;
