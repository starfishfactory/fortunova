import { describe, it, expect, afterEach, vi } from 'vitest';

describe('config', () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
    vi.resetModules();
  });

  it('기본값을 제공한다', async () => {
    const { config } = await import('../src/config.js');

    expect(config.port).toBe(3000);
    expect(config.databasePath).toBe('./data/fortunova.db');
    expect(config.jwtSecret).toBe('dev-secret-change-in-production');
    expect(config.jwtExpiresIn).toBe('24h');
    expect(config.bcryptSaltRounds).toBe(12);
    expect(config.dailyFreeLimit).toBe(3);
    expect(config.maxOldSpaceSize).toBe(384);
  });

  it('환경변수로 port를 오버라이드한다', async () => {
    process.env = { ...originalEnv, PORT: '8080' };
    const { config } = await import('../src/config.js');

    expect(config.port).toBe(8080);
  });

  it('환경변수로 databasePath를 오버라이드한다', async () => {
    process.env = { ...originalEnv, DATABASE_PATH: '/custom/path.db' };
    const { config } = await import('../src/config.js');

    expect(config.databasePath).toBe('/custom/path.db');
  });

  it('환경변수로 jwtSecret을 오버라이드한다', async () => {
    process.env = { ...originalEnv, JWT_SECRET: 'my-production-secret' };
    const { config } = await import('../src/config.js');

    expect(config.jwtSecret).toBe('my-production-secret');
  });
});
