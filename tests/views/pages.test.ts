import { describe, it, expect } from 'vitest';
import app from '@/app.js';

describe('Pages 라우트', () => {
  it('GET / 가 200 상태코드와 HTML을 반환한다', async () => {
    const res = await app.request('/');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/html');
  });

  it('GET / 응답에 생년월일 입력 form이 포함된다', async () => {
    const res = await app.request('/');
    const html = await res.text();
    expect(html).toContain('<form');
    expect(html).toContain('name="year"');
    expect(html).toContain('name="month"');
    expect(html).toContain('name="day"');
    expect(html).toContain('name="hour"');
    expect(html).toContain('name="gender"');
    expect(html).toContain('name="calendarType"');
    expect(html).toContain('name="category"');
  });

  it('GET / 응답에 HTMX 속성이 포함된다', async () => {
    const res = await app.request('/');
    const html = await res.text();
    expect(html).toContain('hx-post');
    expect(html).toContain('hx-target');
    expect(html).toContain('hx-indicator');
    expect(html).toContain('htmx.org');
  });

  it('GET / 응답에 Tailwind CSS CDN이 포함된다', async () => {
    const res = await app.request('/');
    const html = await res.text();
    expect(html).toContain('tailwindcss');
  });

  it('GET / 응답에 레이아웃 요소가 포함된다', async () => {
    const res = await app.request('/');
    const html = await res.text();
    expect(html).toContain('Fortunova');
    expect(html).toContain('<header');
    expect(html).toContain('<footer');
  });
});
