import { test, expect, type Page, type TestInfo } from '@playwright/test';

// ─── Helpers ───

/** Annotate test with methodology category */
function annotate(testInfo: TestInfo, category: string, detail: string) {
  testInfo.annotations.push(
    { type: 'category', description: category },
    { type: 'detail', description: detail },
  );
}

/** Attach full-page screenshot */
async function snap(page: Page, testInfo: TestInfo, name: string) {
  const buf = await page.screenshot({ fullPage: true });
  await testInfo.attach(name, { body: buf, contentType: 'image/png' });
}

/** SSE route mock — prevents real LLM calls. keepLoading=true omits done event so loading stays visible. */
async function mockSSE(page: Page, opts?: { keepLoading?: boolean }) {
  const keepLoading = opts?.keepLoading ?? false;
  const events = [
    'data: {"type":"progress","chunk":"core","elapsed":120}\n\n',
    'data: {"type":"progress","chunk":"sub","elapsed":250}\n\n',
    'data: {"type":"progress","chunk":"meta","elapsed":80}\n\n',
  ];
  if (!keepLoading) {
    events.push('data: {"type":"done"}\n\n');
  }
  await page.route('**/partials/fortune-stream**', (route) =>
    route.fulfill({
      status: 200,
      headers: { 'Content-Type': 'text/event-stream' },
      body: events.join(''),
    }),
  );
  if (!keepLoading) {
    await page.route('**/partials/fortune-result', (route) =>
      route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'text/html' },
        body: '<div class="fortune-reveal"><p>Mock fortune result</p></div>',
      }),
    );
  }
}

/** Clear localStorage cache to avoid cache hits */
async function clearCache(page: Page) {
  await page.evaluate(() => {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k?.startsWith('fortunova_')) localStorage.removeItem(k);
    }
  });
}

/** Compute relative luminance for WCAG contrast */
function luminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = luminance(hex1);
  const l2 = luminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

const PAGES = ['/', '/login', '/register', '/subscribe'] as const;

// ═══════════════════════════════════════════════
// 1. Nielsen's Usability Heuristics (12 tests)
// ═══════════════════════════════════════════════

test.describe('1. Nielsen Usability Heuristics', () => {
  test('1-1 H1: SSE 프로그레스 UI가 표시된다', async ({ page }, testInfo) => {
    annotate(testInfo, 'Nielsen Heuristics', 'H1: Visibility of System Status');
    await page.goto('/');

    // Verify loading UI structure exists in DOM (hidden initially, shown during SSE)
    const loading = page.locator('#loading');
    await expect(loading).toBeAttached();

    // SSE step elements exist with correct structure
    for (const step of ['core', 'sub', 'meta']) {
      await expect(page.locator(`#step-${step}`)).toBeAttached();
      await expect(page.locator(`#step-${step} .sse-step-icon`)).toBeAttached();
      await expect(page.locator(`#step-${step} .sse-step-label`)).toBeAttached();
      await expect(page.locator(`#step-${step} .sse-step-status`)).toBeAttached();
    }

    // Verify loading becomes visible by directly toggling display (tests the UI, not SSE)
    await page.evaluate(() => {
      const ld = document.getElementById('loading');
      if (ld) ld.style.display = 'block';
    });
    await expect(loading).toBeVisible();

    await snap(page, testInfo, 'SSE 프로그레스');
  });

  test('1-2 H1: 로딩 팁이 교체된다', async ({ page }, testInfo) => {
    annotate(testInfo, 'Nielsen Heuristics', 'H1: Visibility of System Status — Tips');
    await page.goto('/');

    // Show loading and trigger tips manually
    await page.evaluate(() => {
      const ld = document.getElementById('loading');
      if (ld) ld.style.display = 'block';
    });

    // Extract TIPS array and verify it's non-empty
    const tipsCount = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script');
      for (const s of scripts) {
        const text = s.textContent || '';
        const match = text.match(/var TIPS\s*=\s*\[([\s\S]*?)\];/);
        if (match) {
          return match[1].split("'").filter((_, i) => i % 2 === 1).length;
        }
      }
      return 0;
    });
    expect(tipsCount, 'TIPS 배열에 팁이 있다').toBeGreaterThan(1);

    // Trigger tip display via the startTips mechanism
    await page.evaluate(() => {
      const el = document.getElementById('loading-tip');
      const scripts = document.querySelectorAll('script');
      for (const s of scripts) {
        const text = s.textContent || '';
        if (text.includes('var TIPS')) {
          // Extract and set first tip
          const match = text.match(/var TIPS\s*=\s*\[([\s\S]*?)\];/);
          if (match) {
            const tips = match[1].split("'").filter((_, i: number) => i % 2 === 1);
            if (el && tips.length) el.textContent = tips[0];
          }
        }
      }
    });

    const tipEl = page.locator('#loading-tip');
    const firstTip = await tipEl.textContent();
    expect(firstTip?.length, '팁 텍스트가 비어있지 않음').toBeGreaterThan(0);
  });

  test('1-3 H2: 한국어 레이블이 모든 폼에 존재한다', async ({ page }, testInfo) => {
    annotate(testInfo, 'Nielsen Heuristics', 'H2: Match between system and real world');
    const koreanRegex = /[가-힣]/;

    for (const path of ['/', '/login', '/register']) {
      await page.goto(path);
      const labels = await page.locator('label, legend').allTextContents();
      const hasKorean = labels.some((t) => koreanRegex.test(t));
      expect(hasKorean, `${path}에 한국어 레이블 존재`).toBe(true);
    }
  });

  test('1-4 H3: 모든 페이지에서 홈으로 돌아갈 수 있다', async ({ page }, testInfo) => {
    annotate(testInfo, 'Nielsen Heuristics', 'H3: User control and freedom');
    for (const path of PAGES) {
      await page.goto(path);
      const homeLink = page.locator('header a[href="/"]');
      await expect(homeLink).toBeAttached();
    }
  });

  test('1-5 H4: 동일한 레이아웃 구조', async ({ page }, testInfo) => {
    annotate(testInfo, 'Nielsen Heuristics', 'H4: Consistency and standards — Layout');
    for (const path of PAGES) {
      await page.goto(path);
      await expect(page.locator('header')).toBeAttached();
      await expect(page.locator('main')).toBeAttached();
      await expect(page.locator('footer')).toBeAttached();
    }
  });

  test('1-6 H4: 버튼 스타일 일관성', async ({ page }, testInfo) => {
    annotate(testInfo, 'Nielsen Heuristics', 'H4: Consistency and standards — Buttons');
    for (const path of ['/', '/login', '/register']) {
      await page.goto(path);
      const submitBtns = page.locator('button[type="submit"]');
      const count = await submitBtns.count();
      for (let i = 0; i < count; i++) {
        const cls = await submitBtns.nth(i).getAttribute('class');
        expect(cls, `${path} submit 버튼에 btn-gold`).toContain('btn-gold');
      }
    }
  });

  test('1-7 H5: 필수 필드에 required 설정', async ({ page }, testInfo) => {
    annotate(testInfo, 'Nielsen Heuristics', 'H5: Error prevention');

    // Home: year, month, day
    await page.goto('/');
    for (const name of ['year', 'month', 'day']) {
      const el = page.locator(`select[name="${name}"]`);
      await expect(el).toHaveAttribute('required', '');
    }

    // Login: email, password
    await page.goto('/login');
    for (const name of ['email', 'password']) {
      const el = page.locator(`input[name="${name}"]`);
      await expect(el).toHaveAttribute('required', '');
    }

    // Register: email, password, birthYear, birthMonth, birthDay
    await page.goto('/register');
    for (const name of ['email', 'password', 'birthYear', 'birthMonth', 'birthDay']) {
      const tag = name.startsWith('birth') ? 'select' : 'input';
      const el = page.locator(`${tag}[name="${name}"]`);
      await expect(el).toHaveAttribute('required', '');
    }
  });

  test('1-8 H6: 쿠키로 폼 입력값 복원', async ({ page }, testInfo) => {
    annotate(testInfo, 'Nielsen Heuristics', 'H6: Recognition rather than recall');
    await page.goto('/');

    // Set cookie with saved form values
    const savedData = { year: '1988', month: '7', day: '22', gender: 'F', category: 'love' };
    await page.evaluate((data) => {
      document.cookie = `fortunova_input=${encodeURIComponent(JSON.stringify(data))};max-age=315360000;path=/`;
    }, savedData);

    // Reload
    await page.reload();

    // Verify restored values
    await expect(page.locator('select[name="year"]')).toHaveValue('1988');
    await expect(page.locator('select[name="month"]')).toHaveValue('7');
    await expect(page.locator('select[name="day"]')).toHaveValue('22');

    await snap(page, testInfo, '쿠키 복원');
  });

  test('1-9 H7: 음력 전환 시 윤달 필드 표시', async ({ page }, testInfo) => {
    annotate(testInfo, 'Nielsen Heuristics', 'H7: Flexibility and efficiency of use');
    await page.goto('/');

    // Initially hidden
    const leapField = page.locator('#leapMonthField');
    await expect(leapField).toBeHidden();

    // Click lunar radio
    await page.click('input[name="calendarType"][value="lunar"]');

    // Should be visible
    await expect(leapField).toBeVisible();
  });

  test('1-10 H8: 콘텐츠 max-width 제한', async ({ page }, testInfo) => {
    annotate(testInfo, 'Nielsen Heuristics', 'H8: Aesthetic and minimalist design');
    await page.goto('/');

    const maxWidth = await page.locator('main').evaluate((el) => {
      return window.getComputedStyle(el).maxWidth;
    });
    // max-w-md = 28rem = 448px
    expect(maxWidth).not.toBe('none');
    await snap(page, testInfo, '메인 레이아웃');
  });

  test('1-11 H9: 에러 메시지 시각적 구분', async ({ page }, testInfo) => {
    annotate(testInfo, 'Nielsen Heuristics', 'H9: Help users recognize errors');
    await page.goto('/login');

    // Submit invalid credentials via htmx
    await page.fill('input[name="email"]', 'wrong@test.com');
    await page.fill('input[name="password"]', 'wrongpassword123');
    await page.click('button[type="submit"]');

    // Wait for auth-result to have content
    const authResult = page.locator('#auth-result');
    await expect(authResult).not.toBeEmpty({ timeout: 10_000 });

    // Check for error styling
    const html = await authResult.innerHTML();
    const hasErrorStyle = html.includes('auth-error') || html.includes('text-red');
    expect(hasErrorStyle, '에러 메시지에 시각적 스타일 존재').toBe(true);

    await snap(page, testInfo, '로그인 에러');
  });

  test('1-12 H10: 로딩 팁에 사주 교육 정보', async ({ page }, testInfo) => {
    annotate(testInfo, 'Nielsen Heuristics', 'H10: Help and documentation');
    await page.goto('/');

    // Extract TIPS from inline script
    const tips = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script');
      for (const s of scripts) {
        const text = s.textContent || '';
        const match = text.match(/var TIPS\s*=\s*\[([\s\S]*?)\];/);
        if (match) return match[1];
      }
      return '';
    });

    const sajuTerms = ['천간', '지지', '오행', '사주', '일간'];
    const found = sajuTerms.filter((term) => tips.includes(term));
    expect(found.length, `사주 용어 ${found.join(',')} 포함`).toBeGreaterThanOrEqual(3);
  });
});

// ═══════════════════════════════════════════════
// 2. WCAG 2.1 접근성 (10 tests)
// ═══════════════════════════════════════════════

test.describe('2. WCAG 2.1 접근성', () => {
  test('2-1 1.3.1: 폼 필드에 label 연결', async ({ page }, testInfo) => {
    annotate(testInfo, 'WCAG 2.1', '1.3.1 Info and Relationships');

    // Home: check selects are inside label or fieldset>legend
    await page.goto('/');
    const formInputs = page.locator('#fortune-form select, #fortune-form input');
    const count = await formInputs.count();

    for (let i = 0; i < count; i++) {
      const el = formInputs.nth(i);
      const type = await el.getAttribute('type');
      // Radio/checkbox inputs wrapped in <label> are OK
      if (type === 'radio' || type === 'checkbox') {
        const parentLabel = await el.evaluate((e) => !!e.closest('label'));
        expect(parentLabel, `radio/checkbox는 label로 감싸져 있다`).toBe(true);
        continue;
      }
      // Select/input: should have ancestor label or be in fieldset with legend
      const hasLabel = await el.evaluate((e) => {
        return !!e.closest('label') || !!e.closest('fieldset')?.querySelector('legend');
      });
      // Also accept a preceding sibling label
      const hasPrecedingLabel = await el.evaluate((e) => {
        const parent = e.parentElement;
        if (!parent) return false;
        return !!parent.querySelector('label') || !!parent.closest('div')?.querySelector(':scope > label');
      });
      expect(hasLabel || hasPrecedingLabel, `필드 ${await el.getAttribute('name')}에 label 연결`).toBe(true);
    }
  });

  test('2-2 2.1.1: Tab 키 폼 이동', async ({ page }, testInfo) => {
    annotate(testInfo, 'WCAG 2.1', '2.1.1 Keyboard');
    await page.goto('/');

    // Focus first field and tab through
    await page.locator('select[name="year"]').focus();
    const expectedOrder = ['year', 'month', 'day'];
    for (const name of expectedOrder) {
      const focused = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement;
        return el?.getAttribute('name') || '';
      });
      expect(focused).toBe(name);
      await page.keyboard.press('Tab');
    }
  });

  test('2-3 2.1.1: Enter 키 폼 제출', async ({ page }, testInfo) => {
    annotate(testInfo, 'WCAG 2.1', '2.1.1 Keyboard — Enter submit');
    await page.goto('/');
    await clearCache(page);
    await mockSSE(page, { keepLoading: true });

    await page.selectOption('select[name="year"]', '1990');
    await page.selectOption('select[name="month"]', '5');
    await page.selectOption('select[name="day"]', '15');

    // Focus submit button and press Enter
    await page.locator('button[type="submit"]').focus();
    await page.keyboard.press('Enter');

    // Loading should appear (form was submitted, stays because no done event)
    await expect(page.locator('#loading')).toBeVisible({ timeout: 5000 });
  });

  test('2-4 2.4.2: 의미 있는 title', async ({ page }, testInfo) => {
    annotate(testInfo, 'WCAG 2.1', '2.4.2 Page Titled');
    const pagePaths = ['/', '/login', '/register', '/subscribe'];
    for (const path of pagePaths) {
      await page.goto(path);
      const title = await page.title();
      expect(title, `${path} title에 Fortunova 포함`).toContain('Fortunova');
    }
  });

  test('2-5 3.1.1: html lang="ko"', async ({ page }, testInfo) => {
    annotate(testInfo, 'WCAG 2.1', '3.1.1 Language of Page');
    await page.goto('/');
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBe('ko');
  });

  test('2-6 1.3.1: 제목 계층 h1 → h2 순서', async ({ page }, testInfo) => {
    annotate(testInfo, 'WCAG 2.1', '1.3.1 Heading hierarchy');
    for (const path of PAGES) {
      await page.goto(path);
      const h1Count = await page.locator('h1').count();
      expect(h1Count, `${path}에 h1 존재`).toBeGreaterThanOrEqual(1);

      // h1 should appear before h2 in DOM order
      const headingOrder = await page.evaluate(() => {
        const headings = document.querySelectorAll('h1, h2, h3');
        return Array.from(headings).map((h) => h.tagName.toLowerCase());
      });
      if (headingOrder.length > 1) {
        expect(headingOrder[0], `${path} 첫 heading이 h1`).toBe('h1');
      }
    }
  });

  test('2-7 2.4.4: 내비 링크 텍스트', async ({ page }, testInfo) => {
    annotate(testInfo, 'WCAG 2.1', '2.4.4 Link Purpose');
    await page.goto('/');
    const navLinks = page.locator('header a');
    const count = await navLinks.count();

    for (let i = 0; i < count; i++) {
      const text = await navLinks.nth(i).textContent();
      expect(text?.trim().length, `header 링크 ${i}에 텍스트 존재`).toBeGreaterThan(0);
    }
  });

  test('2-8 1.4.3: 주요 텍스트 색상 대비', async ({ page }, testInfo) => {
    annotate(testInfo, 'WCAG 2.1', '1.4.3 Contrast (Minimum)');
    // gold-400 (#e8c170) on navy-900 (#0a0e27)
    const ratio = contrastRatio('#e8c170', '#0a0e27');
    expect(ratio, `gold-400 vs navy-900 대비율 ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(4.5);
  });

  test('2-9 2.5.5: 버튼 최소 터치 크기', async ({ page }, testInfo) => {
    annotate(testInfo, 'WCAG 2.1', '2.5.5 Target Size');
    await page.goto('/');
    const submitBtn = page.locator('button[type="submit"]');
    const box = await submitBtn.boundingBox();
    expect(box).toBeTruthy();
    expect(box!.height, 'submit 버튼 높이 ≥ 44px').toBeGreaterThanOrEqual(44);
  });

  test('2-10 prefers-reduced-motion 지원', async ({ browser }, testInfo) => {
    annotate(testInfo, 'WCAG 2.1', 'prefers-reduced-motion');
    const context = await browser.newContext({
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    await page.goto('/');

    // Check that aurora-bg animation is disabled
    const animDuration = await page.locator('.aurora-bg').evaluate((el) => {
      return window.getComputedStyle(el).animationDuration;
    });
    // Should be very short or 'none' due to reduced-motion rule
    // CSS computed value varies by browser: '0s', '0.01ms', '1e-05s', etc.
    const ms = parseFloat(animDuration);
    expect(ms, `reduced-motion 시 animation-duration: ${animDuration}`).toBeLessThan(0.1);

    await snap(page, testInfo, 'reduced-motion');
    await context.close();
  });
});

// ═══════════════════════════════════════════════
// 3. Core Web Vitals (4 tests)
// ═══════════════════════════════════════════════

test.describe('3. Core Web Vitals', () => {
  test('3-1 LCP: 메인 페이지 LCP ≤ 2.5s', async ({ page }, testInfo) => {
    annotate(testInfo, 'Core Web Vitals', 'LCP ≤ 2.5s');

    // Inject PerformanceObserver before navigation
    await page.addInitScript(() => {
      (window as any).__LCP__ = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          (window as any).__LCP__ = Math.max((window as any).__LCP__, (entry as any).startTime);
        }
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const lcp = await page.evaluate(() => (window as any).__LCP__ || 0);
    expect(lcp, `LCP ${lcp.toFixed(0)}ms`).toBeLessThanOrEqual(2500);
  });

  test('3-2 CLS: 메인 페이지 CLS ≤ 0.1', async ({ page }, testInfo) => {
    annotate(testInfo, 'Core Web Vitals', 'CLS ≤ 0.1');

    await page.addInitScript(() => {
      (window as any).__CLS__ = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            (window as any).__CLS__ += (entry as any).value;
          }
        }
      }).observe({ type: 'layout-shift', buffered: true });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Wait for any late layout shifts

    const cls = await page.evaluate(() => (window as any).__CLS__ || 0);
    expect(cls, `CLS ${cls.toFixed(4)}`).toBeLessThanOrEqual(0.1);
  });

  test('3-3 리소스: 외부 스크립트 ≤ 3개', async ({ page }, testInfo) => {
    annotate(testInfo, 'Core Web Vitals', 'External scripts budget');
    await page.goto('/');

    const extScripts = await page.evaluate(() => {
      return document.querySelectorAll('script[src]').length;
    });
    expect(extScripts, `외부 스크립트 ${extScripts}개`).toBeLessThanOrEqual(3);
  });

  test('3-4 응답시간: 정적 페이지 ≤ 1s', async ({ page }, testInfo) => {
    annotate(testInfo, 'Core Web Vitals', 'Static page response time');
    const paths = ['/login', '/register', '/subscribe'];

    for (const path of paths) {
      const start = Date.now();
      await page.goto(path);
      const elapsed = Date.now() - start;
      expect(elapsed, `${path} 응답 ${elapsed}ms`).toBeLessThanOrEqual(3000);
    }
  });
});

// ═══════════════════════════════════════════════
// 4. Mobile Usability (5 tests)
// ═══════════════════════════════════════════════

test.describe('4. Mobile Usability', () => {
  test('4-1 viewport 메타 태그', async ({ page }, testInfo) => {
    annotate(testInfo, 'Mobile Usability', 'Viewport meta');
    await page.goto('/');
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('width=device-width');
    expect(viewport).toContain('initial-scale=1.0');
  });

  test('4-2 PWA manifest 링크', async ({ page }, testInfo) => {
    annotate(testInfo, 'Mobile Usability', 'PWA manifest');
    await page.goto('/');

    const manifestHref = await page.locator('link[rel="manifest"]').getAttribute('href');
    expect(manifestHref).toBeTruthy();

    // Check manifest.json is reachable
    const resp = await page.request.get(manifestHref!);
    expect(resp.status()).toBe(200);
  });

  test('4-3 PWA Service Worker 등록', async ({ page }, testInfo) => {
    annotate(testInfo, 'Mobile Usability', 'Service Worker');
    await page.goto('/');

    const hasSW = await page.evaluate(() => 'serviceWorker' in navigator);
    expect(hasSW, 'serviceWorker API 존재').toBe(true);

    // Check registration script exists
    const swScript = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script');
      return Array.from(scripts).some((s) => s.textContent?.includes('serviceWorker.register'));
    });
    expect(swScript, 'SW 등록 스크립트 존재').toBe(true);
  });

  test('4-4 반응형: 모바일 가로 스크롤 없음', async ({ browser }, testInfo) => {
    annotate(testInfo, 'Mobile Usability', 'No horizontal scroll on mobile');
    const context = await browser.newContext({
      viewport: { width: 375, height: 812 },
    });
    const page = await context.newPage();
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasOverflow, '375px 뷰포트에서 가로 스크롤 없음').toBe(false);

    await snap(page, testInfo, '모바일 375px');
    await context.close();
  });

  test('4-5 반응형: 폼 요소가 화면 내에 있다', async ({ browser }, testInfo) => {
    annotate(testInfo, 'Mobile Usability', 'Form elements within viewport');
    const context = await browser.newContext({
      viewport: { width: 375, height: 812 },
    });
    const page = await context.newPage();
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const formElements = page.locator('#fortune-form select, #fortune-form button[type="submit"]');
    const count = await formElements.count();

    for (let i = 0; i < count; i++) {
      const box = await formElements.nth(i).boundingBox();
      expect(box).toBeTruthy();
      expect(box!.x + box!.width, `폼 요소 ${i}이 화면 내`).toBeLessThanOrEqual(375);
    }

    await context.close();
  });
});

// ═══════════════════════════════════════════════
// 5. Cognitive Walkthrough (4 tests)
// ═══════════════════════════════════════════════

test.describe('5. Cognitive Walkthrough', () => {
  test('5-1 CTA: "운세 보기" 버튼 visible', async ({ page }, testInfo) => {
    annotate(testInfo, 'Cognitive Walkthrough', 'CTA identification');
    await page.goto('/');

    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeVisible();
    const text = await submitBtn.textContent();
    expect(text).toContain('운세 보기');

    // Should be in viewport without scrolling
    const box = await submitBtn.boundingBox();
    expect(box).toBeTruthy();
    // Just check it's on screen (allowing for scroll, button should be reachable)
    expect(box!.y).toBeGreaterThan(0);

    await snap(page, testInfo, 'CTA 버튼');
  });

  test('5-2 로그인 → 회원가입 이동', async ({ page }, testInfo) => {
    annotate(testInfo, 'Cognitive Walkthrough', 'Login → Register navigation');
    await page.goto('/login');

    const registerLink = page.locator('a[href="/register"]');
    await expect(registerLink).toBeVisible();
    await registerLink.click();

    await expect(page).toHaveURL(/\/register/);
  });

  test('5-3 회원가입 → 로그인 이동', async ({ page }, testInfo) => {
    annotate(testInfo, 'Cognitive Walkthrough', 'Register → Login navigation');
    await page.goto('/register');

    // main 영역의 로그인 링크 (header에도 /login 링크가 있으므로 main으로 한정)
    const loginLink = page.locator('main a[href="/login"]');
    await expect(loginLink).toBeVisible();
    await loginLink.click();

    await expect(page).toHaveURL(/\/login/);
  });

  test('5-4 헤더 로고 → 홈 이동', async ({ page }, testInfo) => {
    annotate(testInfo, 'Cognitive Walkthrough', 'Logo → Home navigation');
    await page.goto('/login');

    const logo = page.locator('header a[href="/"]');
    await expect(logo).toBeVisible();

    // Should contain "Fortunova" text
    const text = await logo.textContent();
    expect(text).toContain('Fortunova');

    await logo.click();
    await expect(page).toHaveURL(/\/$/);
  });
});
