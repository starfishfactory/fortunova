import { describe, it, expect } from 'vitest';
import app from '@/app.js';

describe('Hono App', () => {
  it('GET / 가 HTML 페이지를 반환한다', async () => {
    const res = await app.request('/');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/html');
    const html = await res.text();
    expect(html).toContain('Fortunova');
  });

  it('GET /health 가 상태를 반환한다', async () => {
    const res = await app.request('/health');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
  });
});
