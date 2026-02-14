import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/db/connection.js', () => ({
  getDatabase: vi.fn(),
}));

vi.mock('bcryptjs', () => ({
  hash: vi.fn(),
  compare: vi.fn(),
}));

vi.mock('jose', () => {
  class MockSignJWT {
    setProtectedHeader() { return this; }
    setExpirationTime() { return this; }
    sign() { return Promise.resolve('mock-jwt-token'); }
  }
  return {
    SignJWT: MockSignJWT,
    jwtVerify: vi.fn(),
  };
});

import { register, login, verifyToken } from '@/services/auth.js';
import { getDatabase } from '@/db/connection.js';
import { hash, compare } from 'bcryptjs';
import { jwtVerify } from 'jose';

const mockGetDatabase = vi.mocked(getDatabase);
const mockHash = vi.mocked(hash);
const mockCompare = vi.mocked(compare);
const mockJwtVerify = vi.mocked(jwtVerify);

function createMockDb() {
  const mockRun = vi.fn().mockReturnValue({ lastInsertRowid: 1, changes: 1 });
  const mockGet = vi.fn();
  const mockPrepare = vi.fn().mockReturnValue({ run: mockRun, get: mockGet });
  return { prepare: mockPrepare, _run: mockRun, _get: mockGet };
}

const validRegisterInput = {
  email: 'test@example.com',
  password: 'password123',
  gender: 'M' as const,
  birthYear: 1990,
  birthMonth: 5,
  birthDay: 15,
  birthHour: 14,
};

describe('auth 서비스', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('새 사용자를 등록한다', async () => {
      const mockDb = createMockDb();
      mockDb._get.mockReturnValue(undefined); // no existing user
      mockGetDatabase.mockReturnValue(mockDb as any);
      mockHash.mockResolvedValue('hashed-password' as any);

      const result = await register(validRegisterInput);

      expect(result.user.email).toBe('test@example.com');
      expect(result.user.gender).toBe('M');
      expect(result.user.birthYear).toBe(1990);
      expect(result.token).toBe('mock-jwt-token');
    });

    it('이미 존재하는 이메일이면 에러를 던진다', async () => {
      const mockDb = createMockDb();
      mockDb._get.mockReturnValue({ id: 1 }); // existing user
      mockGetDatabase.mockReturnValue(mockDb as any);

      await expect(register(validRegisterInput)).rejects.toThrow('EMAIL_ALREADY_EXISTS');
    });

    it('birthHour가 없으면 null로 저장한다', async () => {
      const mockDb = createMockDb();
      mockDb._get.mockReturnValue(undefined);
      mockGetDatabase.mockReturnValue(mockDb as any);
      mockHash.mockResolvedValue('hashed' as any);

      const input = { ...validRegisterInput, birthHour: undefined };
      const result = await register(input);

      expect(result.user.birthHour).toBeNull();
    });

    it('isLunar/isLeapMonth 기본값은 false이다', async () => {
      const mockDb = createMockDb();
      mockDb._get.mockReturnValue(undefined);
      mockGetDatabase.mockReturnValue(mockDb as any);
      mockHash.mockResolvedValue('hashed' as any);

      const result = await register(validRegisterInput);

      expect(result.user.isLunar).toBe(false);
      expect(result.user.isLeapMonth).toBe(false);
    });
  });

  describe('login', () => {
    const dbRow = {
      id: 1,
      email: 'test@example.com',
      password_hash: 'hashed-password',
      gender: 'M',
      birth_year: 1990,
      birth_month: 5,
      birth_day: 15,
      birth_hour: 14,
      is_lunar: 0,
      is_leap_month: 0,
    };

    it('올바른 자격 증명으로 로그인한다', async () => {
      const mockDb = createMockDb();
      mockDb._get.mockReturnValue(dbRow);
      mockGetDatabase.mockReturnValue(mockDb as any);
      mockCompare.mockResolvedValue(true as any);

      const result = await login({ email: 'test@example.com', password: 'password123' });

      expect(result.user.email).toBe('test@example.com');
      expect(result.user.id).toBe(1);
      expect(result.token).toBe('mock-jwt-token');
    });

    it('존재하지 않는 이메일이면 에러를 던진다', async () => {
      const mockDb = createMockDb();
      mockDb._get.mockReturnValue(undefined);
      mockGetDatabase.mockReturnValue(mockDb as any);

      await expect(login({ email: 'wrong@example.com', password: 'pass' }))
        .rejects.toThrow('INVALID_CREDENTIALS');
    });

    it('비밀번호가 틀리면 에러를 던진다', async () => {
      const mockDb = createMockDb();
      mockDb._get.mockReturnValue(dbRow);
      mockGetDatabase.mockReturnValue(mockDb as any);
      mockCompare.mockResolvedValue(false as any);

      await expect(login({ email: 'test@example.com', password: 'wrong' }))
        .rejects.toThrow('INVALID_CREDENTIALS');
    });

    it('is_lunar/is_leap_month를 boolean으로 변환한다', async () => {
      const mockDb = createMockDb();
      mockDb._get.mockReturnValue({ ...dbRow, is_lunar: 1, is_leap_month: 1 });
      mockGetDatabase.mockReturnValue(mockDb as any);
      mockCompare.mockResolvedValue(true as any);

      const result = await login({ email: 'test@example.com', password: 'password123' });

      expect(result.user.isLunar).toBe(true);
      expect(result.user.isLeapMonth).toBe(true);
    });
  });

  describe('verifyToken', () => {
    it('유효한 토큰을 검증한다', async () => {
      mockJwtVerify.mockResolvedValue({
        payload: { userId: 1, email: 'test@example.com' },
        protectedHeader: { alg: 'HS256' },
      } as any);

      const result = await verifyToken('valid-token');

      expect(result.userId).toBe(1);
      expect(result.email).toBe('test@example.com');
    });

    it('유효하지 않은 토큰이면 에러를 던진다', async () => {
      mockJwtVerify.mockRejectedValue(new Error('invalid token'));

      await expect(verifyToken('invalid-token')).rejects.toThrow();
    });
  });
});
