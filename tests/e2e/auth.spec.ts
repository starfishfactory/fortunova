import { test, expect } from '@playwright/test';

test.describe('인증 플로우', () => {
  test('로그인 - 빈 필드 제출 시 브라우저 유효성 검사가 동작한다', async ({ page }) => {
    await page.goto('/login');

    // email, password 모두 required — 빈 상태로 제출 시 브라우저가 차단
    const emailInput = page.locator('input[name="email"]');
    await expect(emailInput).toHaveAttribute('required', '');

    // 제출 시도 후 폼이 여전히 로그인 페이지에 있는지 확인 (서버로 전송 안됨)
    await page.click('button[type="submit"]');
    await expect(emailInput).toBeVisible();
    expect(page.url()).toContain('/login');
  });

  test('로그인 - 잘못된 자격증명 시 에러 메시지가 표시된다', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'nonexistent@test.com');
    await page.fill('input[name="password"]', 'wrongpassword123');
    await page.click('button[type="submit"]');

    // HTMX가 #auth-result에 에러 메시지 렌더링
    const errorMsg = page.locator('#auth-result .text-red-700');
    await expect(errorMsg).toBeVisible({ timeout: 10_000 });
    const text = await errorMsg.textContent();
    expect(text).toContain('올바르지 않습니다');
  });

  test('회원가입 - 짧은 비밀번호 시 브라우저 유효성 검사가 동작한다', async ({ page }) => {
    await page.goto('/register');

    // password에 minlength 속성이 있어 브라우저가 차단
    await page.fill('input[name="email"]', 'test-short-pw@e2e.test');
    await page.fill('input[name="password"]', '1234');
    await page.selectOption('select[name="birthYear"]', '1990');
    await page.selectOption('select[name="birthMonth"]', '1');
    await page.selectOption('select[name="birthDay"]', '1');
    await page.check('input[name="gender"][value="M"]');

    // 제출 시도 — 브라우저 유효성 검사로 차단됨
    await page.click('button[type="submit"]');

    // 여전히 회원가입 페이지
    expect(page.url()).toContain('/register');
  });

  test('로그아웃 API가 정상 동작한다', async ({ request }) => {
    const res = await request.post('/api/auth/logout');
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json.message).toContain('로그아웃');
  });
});
