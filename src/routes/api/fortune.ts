import { Hono } from 'hono';

const fortune = new Hono();

fortune.post('/fortune', async (c) => {
  return c.json({ message: 'Not implemented' }, 501);
});

export default fortune;
