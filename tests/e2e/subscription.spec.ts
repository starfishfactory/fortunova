import { test, expect } from '@playwright/test';

test.describe('구독 시스템', () => {
  test('플랜 목록 API가 정상 응답한다', async ({ request }) => {
    const res = await request.get('/api/v1/subscription/plans');
    expect(res.ok()).toBeTruthy();

    const json = await res.json();
    expect(json.plans).toBeDefined();
    expect(Array.isArray(json.plans)).toBe(true);
    expect(json.plans.length).toBeGreaterThan(0);

    // 플랜 구조 확인
    const plan = json.plans[0];
    expect(plan).toHaveProperty('id');
    expect(plan).toHaveProperty('price');
    expect(plan).toHaveProperty('name');
  });

  test('미인증 상태에서 구독 상태 조회 시 401 반환한다', async ({ request }) => {
    const res = await request.get('/api/v1/subscription/status');
    expect(res.status()).toBe(401);
    const json = await res.json();
    expect(json.code).toBe('UNAUTHORIZED');
  });

  test('미인증 상태에서 구독 시작 시 401 반환한다', async ({ request }) => {
    const res = await request.post('/api/v1/subscription/subscribe', {
      data: { planId: 'monthly', provider: 'toss' },
    });
    expect(res.status()).toBe(401);
  });

  test('미인증 상태에서 구독 취소 시 401 반환한다', async ({ request }) => {
    const res = await request.post('/api/v1/subscription/cancel', {
      data: { subscriptionId: 'fake-id' },
    });
    expect(res.status()).toBe(401);
  });

  test('구독 페이지에 플랜 정보가 표시된다', async ({ page }) => {
    await page.goto('/subscribe');
    const body = await page.textContent('body');
    expect(body).toContain('월간');
  });
});
