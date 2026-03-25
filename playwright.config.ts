import { defineConfig } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'https://fortunova.interfn.com';
const IS_CI = !!process.env.CI;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  retries: IS_CI ? 1 : 0,
  timeout: 180_000, // LLM 응답 대기 고려
  expect: { timeout: 10_000 },
  use: {
    baseURL: BASE_URL,
    headless: IS_CI,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    // 로컬 실행 시 테스트 진행을 볼 수 있도록 슬로우 모션
    launchOptions: {
      slowMo: IS_CI ? 0 : 300,
    },
  },
  outputDir: './test-results',
  reporter: [['list'], ['html', { open: IS_CI ? 'never' : 'on-failure', outputFolder: './playwright-report' }]],
});
