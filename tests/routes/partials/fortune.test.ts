import { describe, it, expect } from 'vitest';
import app from '@/app.js';

describe('Fortune Partials 라우트', () => {
  it('POST /partials/fortune-result 가 200 상태코드와 HTML partial을 반환한다', async () => {
    const formData = new URLSearchParams({
      year: '1990',
      month: '5',
      day: '15',
      hour: '10',
      calendarType: 'solar',
      gender: 'M',
      category: 'daily',
    });

    const res = await app.request('/partials/fortune-result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/html');
  });

  it('POST /partials/fortune-result 응답이 전체 HTML 문서가 아닌 partial이다', async () => {
    const formData = new URLSearchParams({
      year: '1990',
      month: '5',
      day: '15',
      hour: '10',
      calendarType: 'solar',
      gender: 'M',
      category: 'daily',
    });

    const res = await app.request('/partials/fortune-result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    const html = await res.text();
    expect(html).not.toContain('<html');
    expect(html).not.toContain('<!DOCTYPE');
    expect(html).toContain('<div');
  });
});
