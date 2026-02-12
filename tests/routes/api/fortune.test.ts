import { describe, it, expect } from 'vitest';
import fortune from '../../../src/routes/api/fortune.js';

describe('fortune 라우트', () => {
  it('POST /fortune은 501 Not Implemented를 반환한다', async () => {
    const res = await fortune.request('/fortune', { method: 'POST' });
    expect(res.status).toBe(501);
    const body = await res.json();
    expect(body.message).toBe('Not implemented');
  });
});
