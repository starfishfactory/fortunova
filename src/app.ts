import { Hono } from 'hono';
import { logger } from 'hono/logger';
import pages from './routes/pages.js';
import fortunePartials from './routes/partials/fortune.js';

const app = new Hono();

app.use('*', logger());

app.get('/health', (c) => {
  return c.json({ status: 'ok' });
});

app.route('/', pages);
app.route('/partials', fortunePartials);

export default app;
