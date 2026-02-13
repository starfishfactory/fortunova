import { Hono } from 'hono';
import type { AppEnv } from '@/types/hono.js';
import { Layout } from '../views/layout.js';
import { HomePage } from '../views/home.js';
import { LoginPage } from '../views/login.js';
import { RegisterPage } from '../views/register.js';
import { SubscriptionPage } from '../views/subscription.js';
import { MypagePage } from '../views/mypage.js';
import { checkSubscription } from '@/services/subscription.js';

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

pages.get('/subscribe', (c) => {
  return c.html(
    <Layout title="구독">
      <SubscriptionPage />
    </Layout>,
  );
});

pages.get('/mypage', (c) => {
  const user = c.get('user');
  if (!user) {
    return c.redirect('/login');
  }

  const sub = checkSubscription(user.userId);

  return c.html(
    <Layout title="마이페이지">
      <MypagePage
        user={user as any}
        subscription={sub ? { plan: sub.plan, status: sub.status, endDate: sub.endDate } : null}
      />
    </Layout>,
  );
});

export default pages;
