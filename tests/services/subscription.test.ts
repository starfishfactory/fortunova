import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/db/connection.js', () => ({
  getDatabase: vi.fn(),
}));

import {
  getPlans,
  subscribe,
  hasActiveSubscription,
  getUserSubscription,
  cancelSubscription,
} from '@/services/subscription.js';
import { getDatabase } from '@/db/connection.js';

const mockGetDatabase = vi.mocked(getDatabase);

function createMockDb() {
  const mockRun = vi.fn().mockReturnValue({ lastInsertRowid: 1, changes: 1 });
  const mockGet = vi.fn();
  const mockAll = vi.fn().mockReturnValue([]);
  const mockPrepare = vi.fn().mockReturnValue({ run: mockRun, get: mockGet, all: mockAll });
  return { prepare: mockPrepare, _run: mockRun, _get: mockGet, _all: mockAll };
}

describe('subscription 서비스', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPlans', () => {
    it('월간/연간 플랜을 반환한다', () => {
      const plans = getPlans();

      expect(plans).toHaveLength(2);
      expect(plans[0]).toEqual({
        id: 'monthly',
        name: '월간 구독',
        price: 9900,
        durationMonths: 1,
      });
      expect(plans[1]).toEqual({
        id: 'yearly',
        name: '연간 구독',
        price: 99000,
        durationMonths: 12,
      });
    });
  });

  describe('subscribe', () => {
    it('구독을 생성하고 올바른 날짜를 설정한다', () => {
      const mockDb = createMockDb();
      mockDb._get.mockReturnValue(undefined); // no existing subscription
      mockGetDatabase.mockReturnValue(mockDb as any);

      const result = subscribe(1, 'monthly');

      expect(result.userId).toBe(1);
      expect(result.plan).toBe('monthly');
      expect(result.status).toBe('active');
      expect(result.startDate).toBeTruthy();
      expect(result.endDate).toBeTruthy();

      // endDate should be ~1 month after startDate
      const start = new Date(result.startDate);
      const end = new Date(result.endDate);
      const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      expect(diffMonths).toBe(1);
    });

    it('연간 구독은 12개월 후 만료된다', () => {
      const mockDb = createMockDb();
      mockDb._get.mockReturnValue(undefined);
      mockGetDatabase.mockReturnValue(mockDb as any);

      const result = subscribe(1, 'yearly');

      const start = new Date(result.startDate);
      const end = new Date(result.endDate);
      const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      expect(diffMonths).toBe(12);
    });

    it('이미 활성 구독이 있으면 에러를 던진다', () => {
      const mockDb = createMockDb();
      mockDb._get.mockReturnValue({
        id: 1,
        status: 'active',
        end_date: new Date(Date.now() + 86400000).toISOString(),
      });
      mockGetDatabase.mockReturnValue(mockDb as any);

      expect(() => subscribe(1, 'monthly')).toThrow('ALREADY_SUBSCRIBED');
    });
  });

  describe('hasActiveSubscription', () => {
    it('활성 구독이 있으면 true를 반환한다', () => {
      const mockDb = createMockDb();
      mockDb._get.mockReturnValue({
        id: 1,
        status: 'active',
        end_date: new Date(Date.now() + 86400000).toISOString(),
      });
      mockGetDatabase.mockReturnValue(mockDb as any);

      expect(hasActiveSubscription(1)).toBe(true);
    });

    it('구독이 없으면 false를 반환한다', () => {
      const mockDb = createMockDb();
      mockDb._get.mockReturnValue(undefined);
      mockGetDatabase.mockReturnValue(mockDb as any);

      expect(hasActiveSubscription(1)).toBe(false);
    });

    it('만료된 구독이면 false를 반환한다', () => {
      const mockDb = createMockDb();
      mockDb._get.mockReturnValue(undefined); // query filters by endDate > now AND status = active
      mockGetDatabase.mockReturnValue(mockDb as any);

      expect(hasActiveSubscription(1)).toBe(false);
    });

    it('취소된 구독이면 false를 반환한다', () => {
      const mockDb = createMockDb();
      mockDb._get.mockReturnValue(undefined); // query filters by status = active
      mockGetDatabase.mockReturnValue(mockDb as any);

      expect(hasActiveSubscription(1)).toBe(false);
    });
  });

  describe('getUserSubscription', () => {
    it('활성 구독을 반환한다', () => {
      const mockDb = createMockDb();
      const futureDate = new Date(Date.now() + 86400000).toISOString();
      const now = new Date().toISOString();
      mockDb._get.mockReturnValue({
        id: 1,
        user_id: 42,
        plan: 'monthly',
        status: 'active',
        start_date: now,
        end_date: futureDate,
        created_at: now,
      });
      mockGetDatabase.mockReturnValue(mockDb as any);

      const result = getUserSubscription(42);

      expect(result).not.toBeNull();
      expect(result!.id).toBe(1);
      expect(result!.userId).toBe(42);
      expect(result!.plan).toBe('monthly');
      expect(result!.status).toBe('active');
    });

    it('구독이 없으면 null을 반환한다', () => {
      const mockDb = createMockDb();
      mockDb._get.mockReturnValue(undefined);
      mockGetDatabase.mockReturnValue(mockDb as any);

      const result = getUserSubscription(42);

      expect(result).toBeNull();
    });
  });

  describe('cancelSubscription', () => {
    it('구독 상태를 cancelled로 변경한다', () => {
      const mockDb = createMockDb();
      mockDb._get.mockReturnValue({
        id: 1,
        user_id: 42,
        status: 'active',
      });
      mockDb._run.mockReturnValue({ changes: 1 });
      mockGetDatabase.mockReturnValue(mockDb as any);

      cancelSubscription(1, 42);

      expect(mockDb.prepare).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE'),
      );
    });

    it('다른 사용자의 구독을 취소하면 에러를 던진다', () => {
      const mockDb = createMockDb();
      mockDb._get.mockReturnValue({
        id: 1,
        user_id: 99, // different user
        status: 'active',
      });
      mockGetDatabase.mockReturnValue(mockDb as any);

      expect(() => cancelSubscription(1, 42)).toThrow('SUBSCRIPTION_NOT_FOUND');
    });

    it('존재하지 않는 구독을 취소하면 에러를 던진다', () => {
      const mockDb = createMockDb();
      mockDb._get.mockReturnValue(undefined);
      mockGetDatabase.mockReturnValue(mockDb as any);

      expect(() => cancelSubscription(999, 42)).toThrow('SUBSCRIPTION_NOT_FOUND');
    });

    it('이미 취소된 구독을 취소하면 에러를 던진다', () => {
      const mockDb = createMockDb();
      mockDb._get.mockReturnValue({
        id: 1,
        user_id: 42,
        status: 'cancelled',
      });
      mockGetDatabase.mockReturnValue(mockDb as any);

      expect(() => cancelSubscription(1, 42)).toThrow('ALREADY_CANCELLED');
    });
  });
});
