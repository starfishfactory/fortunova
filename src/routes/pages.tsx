import { Hono } from 'hono';

const pages = new Hono();

pages.get('/', (c) => {
  return c.html('<html><body><h1>Fortunova</h1></body></html>');
});

export default pages;
