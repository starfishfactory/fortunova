import { Hono } from 'hono';
import { logger } from 'hono/logger';

const app = new Hono();

app.use('*', logger());

app.get('/', (c) => {
  return c.json({
    name: 'Fortunova',
    version: '0.1.0',
    description: 'AI 사주/명리 운세 시스템',
    status: 'ok',
  });
});

app.get('/health', (c) => {
  return c.json({ status: 'ok' });
});

export default app;
