import { describe, it, expect } from 'vitest';
import { ErrorCodes } from '../src/errors.js';

describe('ErrorCodes', () => {
  it('모든 에러 코드가 status, code, message를 포함한다', () => {
    for (const [key, value] of Object.entries(ErrorCodes)) {
      expect(value).toHaveProperty('status');
      expect(value).toHaveProperty('code');
      expect(value).toHaveProperty('message');
      expect(typeof value.status).toBe('number');
      expect(typeof value.code).toBe('string');
      expect(typeof value.message).toBe('string');
      expect(value.code).toBe(key);
    }
  });

  it('INVALID_BIRTH_DATA는 400 상태코드를 가진다', () => {
    expect(ErrorCodes.INVALID_BIRTH_DATA.status).toBe(400);
    expect(ErrorCodes.INVALID_BIRTH_DATA.code).toBe('INVALID_BIRTH_DATA');
  });

  it('UNSUPPORTED_SYSTEM은 400 상태코드를 가진다', () => {
    expect(ErrorCodes.UNSUPPORTED_SYSTEM.status).toBe(400);
  });

  it('DAILY_LIMIT_EXCEEDED는 429 상태코드를 가진다', () => {
    expect(ErrorCodes.DAILY_LIMIT_EXCEEDED.status).toBe(429);
  });

  it('LLM_UNAVAILABLE은 503 상태코드를 가진다', () => {
    expect(ErrorCodes.LLM_UNAVAILABLE.status).toBe(503);
  });

  it('UNAUTHORIZED는 401 상태코드를 가진다', () => {
    expect(ErrorCodes.UNAUTHORIZED.status).toBe(401);
  });

  it('INVALID_CREDENTIALS는 401 상태코드를 가진다', () => {
    expect(ErrorCodes.INVALID_CREDENTIALS.status).toBe(401);
  });
});
