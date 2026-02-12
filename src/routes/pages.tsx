import { Hono } from 'hono';
import { Layout } from '../views/layout.js';
import { HomePage } from '../views/home.js';

const pages = new Hono();

pages.get('/', (c) => {
  return c.html(
    <Layout>
      <HomePage />
    </Layout>,
  );
});

export default pages;
