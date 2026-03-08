import { test, expect } from '@playwright/test';

test.describe('운세 조회 플로우', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // localStorage 캐시 클리어
    await page.evaluate(() => {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k?.startsWith('fortunova_')) localStorage.removeItem(k);
      }
    });
  });

  test('폼 요소가 모두 존재한다', async ({ page }) => {
    await expect(page.locator('select[name="year"]')).toBeVisible();
    await expect(page.locator('select[name="month"]')).toBeVisible();
    await expect(page.locator('select[name="day"]')).toBeVisible();
    await expect(page.locator('select[name="hour"]')).toBeVisible();
    await expect(page.locator('input[name="gender"]')).toHaveCount(2);
    await expect(page.locator('select[name="category"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('운세 조회 후 풍부한 결과가 표시된다', async ({ page }) => {
    // 폼 입력
    await page.selectOption('select[name="year"]', '1988');
    await page.selectOption('select[name="month"]', '7');
    await page.selectOption('select[name="day"]', '22');
    await page.selectOption('select[name="hour"]', '10');
    await page.check('input[name="gender"][value="M"]');
    await page.selectOption('select[name="category"]', 'daily');

    // 제출 (SSE 방식)
    await page.click('button[type="submit"]');

    // 로딩 UI 표시 확인
    await expect(page.locator('#loading')).toBeVisible({ timeout: 5_000 });

    // 결과 대기 (LLM 응답 → SSE done → POST fortune-result)
    const result = page.locator('#result');
    await expect(result.locator('div').first()).toBeVisible({ timeout: 150_000 });

    // 로딩 UI 사라짐 확인
    await expect(page.locator('#loading')).toBeHidden();

    // 에러 응답 아닌지 확인
    const html = await result.innerHTML();
    expect(html).not.toContain('LLM_UNAVAILABLE');
    expect(html).not.toContain('VALIDATION_ERROR');
    expect(html).not.toContain('파싱에 실패');

    // UX: 폼 접힘 확인
    const formCollapsed = await page.evaluate(
      () => document.getElementById('form-section')?.classList.contains('collapsed'),
    );
    expect(formCollapsed).toBe(true);

    // 요약 바 표시 확인
    await expect(page.locator('#form-summary')).toBeVisible();

    // 결과 텍스트/HTML 검증
    const text = await result.innerText();

    // 핵심 섹션 검증 (소프트 체크 - 70% 이상 통과 필요)
    const checks = [
      ['종합 점수', /\d+\s*점/.test(text)],
      ['오늘의 운세', text.includes('오늘의 운세')],
      ['오행 흐름', text.includes('오행 흐름')],
      ['오늘의 조언', text.includes('오늘의 조언')],
      ['오늘의 팁', html.includes('✨')],
      ['세부 운세', text.includes('세부 운세')],
      ['재물운', text.includes('재물운')],
      ['건강운', text.includes('건강운')],
      ['연애운', text.includes('연애운')],
      ['직장운', text.includes('직장운')],
      ['오행 해설', text.includes('오행 해설')],
      ['행운의 색', text.includes('행운의 색')],
      ['행운의 숫자', text.includes('행운의 숫자')],
      ['주의사항', text.includes('주의사항')],
      ['3개월 운세 흐름', text.includes('3개월 운세 흐름')],
      ['대운 해석', text.includes('대운 해석')],
      ['격언 카드', html.includes('proverb-card')],
      ['사주 정보', text.includes('사주:')],
      ['별점 표시', html.includes('★')],
      ['남은 무료 횟수', text.includes('무료 횟수')],
    ] as const;

    const passed = checks.filter(([, ok]) => ok).length;
    const failed = checks.filter(([, ok]) => !ok).map(([name]) => name);

    // eslint-disable-next-line no-console
    console.log(`\n📊 결과 검증: ${passed}/${checks.length} 통과`);
    if (failed.length > 0) {
      // eslint-disable-next-line no-console
      console.log(`  미통과: ${failed.join(', ')}`);
    }

    expect(passed, `통과 항목 ${passed}/${checks.length}, 미통과: ${failed.join(', ')}`)
      .toBeGreaterThanOrEqual(Math.ceil(checks.length * 0.7));
  });

  test('다시 입력 버튼이 폼을 다시 펼친다', async ({ page }) => {
    // 폼 입력 후 제출
    await page.selectOption('select[name="year"]', '1990');
    await page.selectOption('select[name="month"]', '3');
    await page.selectOption('select[name="day"]', '15');
    await page.check('input[name="gender"][value="F"]');

    await page.click('button[type="submit"]');

    // 폼 접힘 + 요약 바 표시 대기
    await expect(page.locator('#form-summary')).toBeVisible({ timeout: 10_000 });

    // "다시 입력" 클릭
    await page.click('#reopen-form');

    // 폼 다시 펼쳐짐
    const collapsed = await page.evaluate(
      () => document.getElementById('form-section')?.classList.contains('collapsed'),
    );
    expect(collapsed).toBe(false);
  });
});
