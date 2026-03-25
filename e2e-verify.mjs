/**
 * E2E 검증: Sonnet-only 풍부한 운세 결과 Playwright 테스트
 * Generator-Critique 루프: 페이지 로드 → 폼 입력 → 제출 → 풍부한 결과 검증
 */
import { chromium } from 'playwright';

const BASE_URL = 'https://fortunova.interfn.com';

async function verify() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(`Console: ${msg.text()}`);
  });
  page.on('pageerror', err => errors.push(`Page: ${err.message}`));

  try {
    // 1. 메인 페이지 로드
    console.log('[1/6] 메인 페이지 로드...');
    const response = await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    if (!response.ok()) throw new Error(`HTTP ${response.status()}`);
    console.log('  ✓ 정상 로드');

    // 2. 폼 요소 확인
    console.log('[2/6] 폼 요소 확인...');
    await page.waitForSelector('form[hx-post="/partials/fortune-result"]');
    console.log('  ✓ 폼 존재');

    // 3. 폼 입력
    console.log('[3/6] 폼 입력...');
    await page.selectOption('select[name="year"]', '1988');
    await page.selectOption('select[name="month"]', '7');
    await page.selectOption('select[name="day"]', '22');
    await page.selectOption('select[name="hour"]', '10');
    await page.check('input[name="gender"][value="M"]');
    await page.selectOption('select[name="category"]', 'daily');
    console.log('  ✓ 입력 완료');

    // 4. 제출 + 결과 대기
    console.log('[4/6] 운세보기 제출 (최대 120초 대기)...');
    // localStorage 캐시 클리어
    await page.evaluate(() => {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.startsWith('fortunova_')) localStorage.removeItem(k);
      }
    });
    await page.click('button[type="submit"]');
    await page.waitForSelector('#result .fortune-reveal', { timeout: 120000 });
    console.log('  ✓ 결과 수신');

    // 5. 폼 접기 + 로딩 UI 확인
    console.log('[5/6] UX 검증...');
    const formCollapsed = await page.$eval('#form-section', el => el.classList.contains('collapsed'));
    console.log(`  ${formCollapsed ? '✓' : '✗'} 폼 접힘 상태: ${formCollapsed}`);

    const summaryVisible = await page.$eval('#form-summary', el => el.style.display !== 'none');
    console.log(`  ${summaryVisible ? '✓' : '✗'} 요약 바 표시: ${summaryVisible}`);

    // 6. 풍부한 결과 검증 (핵심!)
    console.log('[6/6] 풍부한 운세 결과 검증...');
    const resultHtml = await page.innerHTML('#result');
    const resultText = await page.$eval('#result', el => el.textContent);

    // 에러 체크
    if (resultHtml.includes('LLM_UNAVAILABLE') || resultHtml.includes('VALIDATION_ERROR')) {
      throw new Error(`에러 응답: ${resultHtml.substring(0, 300)}`);
    }
    if (resultHtml.includes('파싱에 실패')) {
      throw new Error('LLM 응답 파싱 실패');
    }

    const checks = [];
    function check(name, passed) {
      checks.push({ name, passed });
      console.log(`  ${passed ? '✓' : '✗'} ${name}`);
    }

    // 종합 점수
    const scoreMatch = resultText.match(/(\d+)\s*점/);
    check('종합 점수', !!scoreMatch);
    if (scoreMatch) console.log(`    → ${scoreMatch[1]}점`);

    // 요약 (summary)
    check('요약 (summary)', resultHtml.includes('font-serif') && resultHtml.includes('text-center'));

    // 상세 설명 (detail) - "오늘의 운세" 섹션
    check('상세 설명 (detail)', resultText.includes('오늘의 운세'));

    // 오행 흐름 (elementInsight)
    check('오행 흐름', resultText.includes('오행 흐름'));

    // 오늘의 조언 (advice)
    check('오늘의 조언', resultText.includes('오늘의 조언'));

    // 오늘의 팁 (dayTip)
    const hasDayTip = resultHtml.includes('✨');
    check('오늘의 팁', hasDayTip);

    // 세부운 그리드 (subFortunes)
    const hasSubFortunes = resultText.includes('세부 운세');
    check('세부 운세 그리드', hasSubFortunes);

    // 세부운 개별 확인
    check('재물운', resultText.includes('재물운'));
    check('건강운', resultText.includes('건강운'));
    check('연애운', resultText.includes('연애운'));
    check('직장운', resultText.includes('직장운'));

    // 오행 해설 (elementExplanation)
    check('오행 해설', resultText.includes('오행 해설'));

    // 행운 정보 (lucky)
    check('행운 정보', resultText.includes('행운'));
    check('행운의 색', resultText.includes('행운의 색'));
    check('행운의 숫자', resultText.includes('행운의 숫자'));

    // 주의사항 (cautions)
    check('주의사항', resultText.includes('주의사항'));

    // 3개월 운세 흐름 (monthlyTrend)
    check('3개월 운세 흐름', resultText.includes('3개월 운세 흐름'));

    // 궁합/인간관계 팁 (compatibilityTip)
    check('궁합 팁', resultText.includes('궁합') || resultText.includes('인간관계'));

    // 대운 해석 (majorFateInterpretation)
    check('대운 해석', resultText.includes('대운 해석'));

    // 격언 (proverb)
    check('격언', resultHtml.includes('proverb-card'));

    // 사주 정보
    check('사주 정보', resultText.includes('사주:'));

    // 남은 횟수
    check('남은 무료 횟수', resultText.includes('무료 횟수'));

    // 별점 (RatingStars)
    check('별점 표시', resultHtml.includes('★'));

    // 결과 요약
    const passed = checks.filter(c => c.passed).length;
    const total = checks.length;
    console.log(`\n📊 결과: ${passed}/${total} 항목 통과`);

    if (passed < total * 0.7) {
      // 스크린샷 + HTML 저장
      await page.screenshot({ path: '/tmp/fortunova-e2e-fail.png', fullPage: true });
      const fs = await import('fs');
      fs.writeFileSync('/tmp/fortunova-e2e-result.html', resultHtml);
      throw new Error(`풍부한 결과 검증 실패: ${passed}/${total} (70% 미달)`);
    }

    // 콘솔 에러
    if (errors.length > 0) {
      console.log(`\n⚠ 콘솔 에러 ${errors.length}건:`);
      errors.forEach(e => console.log(`  - ${e}`));
    }

    console.log('\n✅ E2E 검증 통과!');
  } catch (err) {
    console.error(`\n❌ E2E 검증 실패: ${err.message}`);
    await page.screenshot({ path: '/tmp/fortunova-e2e-fail.png', fullPage: true });
    console.error('  스크린샷: /tmp/fortunova-e2e-fail.png');
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

verify();
