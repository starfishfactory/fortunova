import { describe, it, expect, vi } from 'vitest';
import { Hono } from 'hono';

vi.mock('@/services/fortune.js', () => ({
  getFortune: vi.fn(),
}));

import fortune from '@/routes/api/fortune.js';
import { getFortune } from '@/services/fortune.js';

const mockGetFortune = vi.mocked(getFortune);

const app = new Hono();
// identifier/identifierType context를 설정하는 미들웨어
app.use('*', async (c, next) => {
  c.set('identifier', 'anon:test');
  c.set('identifierType', 'anonymous');
  await next();
});
app.route('/api', fortune);

describe('fortune API 라우트', () => {
  it('유효한 요청에 운세 결과를 반환한다', async () => {
    mockGetFortune.mockResolvedValue({
      fortune: {
        summary: '좋은 하루',
        detail: '상세 설명',
        score: 80,
        advice: '조언',
      },
      sajuSummary: { fourPillars: '경오 신사 갑자 병인', dayMasterStrength: 'weak', todayElement: '목' },
      cached: false,
      remainingFreeCount: 2,
    });

    const res = await app.request('/api/fortune', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        year: 1990, month: 5, day: 15, hour: 14,
        gender: 'M', category: 'daily',
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.fortune.score).toBe(80);
    expect(body.remainingFreeCount).toBe(2);
  });

  it('필수 필드가 없으면 400을 반환한다', async () => {
    const res = await app.request('/api/fortune', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ year: 1990 }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.code).toBe('VALIDATION_ERROR');
  });

  it('LLM 에러 시 503을 반환한다', async () => {
    mockGetFortune.mockRejectedValue(new Error('Claude CLI 에러'));

    const res = await app.request('/api/fortune', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        year: 1990, month: 5, day: 15, gender: 'M',
      }),
    });

    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.code).toBe('LLM_UNAVAILABLE');
  });
});
