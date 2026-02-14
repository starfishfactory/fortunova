import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';

vi.mock('@/services/share.js', () => ({
  createSharedFortune: vi.fn(),
}));

import share from '@/routes/api/share.js';
import { createSharedFortune } from '@/services/share.js';

const mockCreateSharedFortune = vi.mocked(createSharedFortune);

const app = new Hono();
app.route('/api', share);

describe('share API 라우트', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('POST /api/share가 공유 링크를 생성한다', async () => {
    mockCreateSharedFortune.mockReturnValue({
      id: 'abc123def456',
      fortune: { summary: '좋은 하루', detail: '상세', score: 85, advice: '조언' },
      sajuSummary: { fourPillars: '경오', dayMasterStrength: 'weak', todayElement: '목' },
      category: 'daily',
      createdAt: '2026-01-01',
      expiresAt: '2026-01-08',
    });

    const res = await app.request('/api/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fortune: { summary: '좋은 하루', detail: '상세', score: 85, advice: '조언' },
        sajuSummary: { fourPillars: '경오', dayMasterStrength: 'weak', todayElement: '목' },
        category: 'daily',
      }),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.shareId).toBe('abc123def456');
    expect(body.shareUrl).toBe('/share/abc123def456');
  });

  it('필수 필드가 없으면 400을 반환한다', async () => {
    const res = await app.request('/api/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fortune: {} }),
    });

    expect(res.status).toBe(400);
  });
});
