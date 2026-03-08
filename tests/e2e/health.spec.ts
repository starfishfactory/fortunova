import { test, expect } from '@playwright/test';

test.describe('서버 상태 확인', () => {
  test('헬스 체크 API가 정상 응답한다', async ({ request }) => {
    const res = await request.get('/health');
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json.status).toBe('ok');
  });

  test('메인 페이지가 정상 로드된다', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Fortunova/i);
    await expect(page.locator('form#fortune-form')).toBeVisible();
    await expect(page.locator('select[name="year"]')).toBeVisible();
  });

  test('로그인 페이지가 정상 로드된다', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test('회원가입 페이지가 정상 로드된다', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('select[name="birthYear"]')).toBeVisible();
  });

  test('구독 페이지가 정상 로드된다', async ({ page }) => {
    await page.goto('/subscribe');
    const body = await page.textContent('body');
    expect(body).toContain('구독');
  });

  test('미인증 사용자가 마이페이지 접근 시 로그인으로 리다이렉트된다', async ({ page }) => {
    await page.goto('/mypage');
    await page.waitForURL('**/login');
    expect(page.url()).toContain('/login');
  });
});
