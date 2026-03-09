import { test, expect } from '@playwright/test';

const CATEGORIES = ['daily', 'love', 'career', 'health', 'wealth'] as const;

for (const cat of CATEGORIES) {
  test(`카테고리 "${cat}" 운세 조회가 정상 동작한다`, async ({ page }) => {
    await page.goto('/');
    // 캐시 클리어
    await page.evaluate(() => {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k?.startsWith('fortunova_')) localStorage.removeItem(k);
      }
    });

    await page.selectOption('select[name="year"]', '1990');
    await page.selectOption('select[name="month"]', '5');
    await page.selectOption('select[name="day"]', '15');
    await page.selectOption('select[name="hour"]', '10');
    await page.check('input[name="gender"][value="M"]');
    await page.selectOption('select[name="category"]', cat);

    await page.click('button[type="submit"]');

    const result = page.locator('#result');
    // 결과 또는 에러 대기
    await expect(result.locator('div').first()).toBeVisible({ timeout: 150_000 });

    const html = await result.innerHTML();
    const text = await result.innerText();

    // 에러 확인
    const hasError = html.includes('LLM_UNAVAILABLE') || html.includes('VALIDATION_ERROR') || 
                     html.includes('파싱에 실패') || html.includes('일시적인 문제') ||
                     html.includes('일일 무료 횟수');
    
    console.log(`\n[${cat}] 텍스트 길이: ${text.length}자, 에러: ${hasError}`);
    if (hasError) {
      console.log(`[${cat}] HTML 일부: ${html.slice(0, 500)}`);
    } else {
      // 핵심 항목 체크
      const checks = [
        ['점수', /\d+\s*점/.test(text)],
        ['조언', text.includes('조언')],
        ['세부운세', text.includes('재물운') || text.includes('건강운')],
        ['행운정보', text.includes('행운의')],
        ['일간언급', text.includes('일간')],
      ];
      const passed = checks.filter(([,ok]) => ok).length;
      console.log(`[${cat}] 항목 통과: ${passed}/${checks.length} - ${checks.filter(([,ok]) => !ok).map(([n]) => n).join(', ') || 'all ok'}`);
    }

    expect(hasError, `${cat} 카테고리에서 에러 발생`).toBe(false);
    expect(text.length).toBeGreaterThan(100);
  });
}
