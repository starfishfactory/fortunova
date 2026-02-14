import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { serveStatic } from '@hono/node-server/serve-static';
import { optionalAuth } from '@/middleware/auth.js';
import { rateLimitMiddleware } from '@/middleware/rate-limit.js';
import pages from './routes/pages.js';
import fortunePartials from './routes/partials/fortune.js';
import authPartials from './routes/partials/auth.js';
import subscriptionPartials from './routes/partials/subscription.js';
import authApi from './routes/api/auth.js';
import fortuneApi from './routes/api/fortune.js';
import subscriptionApi from './routes/api/subscription.js';

const app = new Hono();

app.use('*', logger());
app.use('/public/*', serveStatic({ root: './' }));

// 인증 미들웨어 (모든 요청에 선택적 적용)
app.use('*', optionalAuth);

app.get('/health', (c) => {
  return c.json({ status: 'ok' });
});

// 페이지 라우트
app.route('/', pages);

// HTMX partial 라우트
app.route('/partials', fortunePartials);
app.route('/partials', authPartials);
app.route('/partials', subscriptionPartials);

// API 라우트 (fortune에만 rate-limit 적용)
app.use('/api/fortune', rateLimitMiddleware);
app.route('/api', authApi);
app.route('/api', fortuneApi);
app.route('/api', subscriptionApi);

// PWA static files
app.get('/manifest.json', serveStatic({ path: './public/manifest.json' }));
app.get('/service-worker.js', serveStatic({ path: './public/service-worker.js' }));

export default app;
