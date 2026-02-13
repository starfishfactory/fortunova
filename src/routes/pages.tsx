import { Hono } from 'hono';
import type { AppEnv } from '@/types/hono.js';
import { Layout } from '../views/layout.js';
import { HomePage } from '../views/home.js';
import { LoginPage } from '../views/login.js';
import { RegisterPage } from '../views/register.js';
import { SubscriptionPage } from '../views/subscription.js';
import { MypagePage } from '../views/mypage.js';
import { SharePage } from '../views/share.js';
import { checkSubscription } from '@/services/subscription.js';
import { getSharedFortune } from '@/services/share.js';

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

pages.get('/share/:id', (c) => {
  const id = c.req.param('id');
  const shared = getSharedFortune(id);

  if (!shared) {
    return c.html(
      <Layout title="공유 운세">
        <div class="mt-8 text-center">
          <p class="text-gray-500">만료되었거나 존재하지 않는 공유 링크입니다.</p>
          <a href="/" class="mt-4 inline-block text-indigo-600 hover:underline">홈으로 돌아가기</a>
        </div>
      </Layout>,
    );
  }

  return c.html(
    <SharePage
      fortune={shared.fortune}
      sajuSummary={shared.sajuSummary}
      category={shared.category}
      shareId={shared.id}
    />,
  );
});

export default pages;
