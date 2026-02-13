import { Hono } from 'hono';
import { Layout } from '../views/layout.js';
import { HomePage } from '../views/home.js';
import { LoginPage } from '../views/login.js';
import { RegisterPage } from '../views/register.js';

const pages = new Hono();

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

export default pages;
