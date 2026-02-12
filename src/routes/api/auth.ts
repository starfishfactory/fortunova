import { Hono } from 'hono';

const auth = new Hono();

auth.post('/auth/register', async (c) => {
  return c.json({ message: 'Not implemented' }, 501);
});

auth.post('/auth/login', async (c) => {
  return c.json({ message: 'Not implemented' }, 501);
});

export default auth;
