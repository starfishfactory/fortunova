import { describe, it, expect } from 'vitest';
import auth from '../../../src/routes/api/auth.js';

describe('auth 라우트', () => {
  it('POST /auth/register는 501 Not Implemented를 반환한다', async () => {
    const res = await auth.request('/auth/register', { method: 'POST' });
    expect(res.status).toBe(501);
    const body = await res.json();
    expect(body.message).toBe('Not implemented');
  });

  it('POST /auth/login은 501 Not Implemented를 반환한다', async () => {
    const res = await auth.request('/auth/login', { method: 'POST' });
    expect(res.status).toBe(501);
    const body = await res.json();
    expect(body.message).toBe('Not implemented');
  });
});
