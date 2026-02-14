import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/db/connection.js', () => ({
  getDatabase: vi.fn(),
}));

import { getPlans, checkSubscription, createSubscription, cancelSubscription } from '@/services/subscription.js';
import { getDatabase } from '@/db/connection.js';

const mockGetDatabase = vi.mocked(getDatabase);

function createMockDb() {
  const mockRun = vi.fn().mockReturnValue({ lastInsertRowid: 1, changes: 1 });
  const mockGet = vi.fn();
  const mockPrepare = vi.fn().mockReturnValue({ run: mockRun, get: mockGet });
  return { prepare: mockPrepare, _run: mockRun, _get: mockGet };
}

describe('subscription 서비스', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPlans', () => {
    it('월간/연간 플랜을 반환한다', () => {
      const plans = getPlans();

      expect(plans).toHaveLength(2);
      expect(plans[0].id).toBe('monthly');
      expect(plans[0].price).toBe(9900);
      expect(plans[1].id).toBe('yearly');
      expect(plans[1].price).toBe(99000);
    });
  });

  describe('checkSubscription', () => {
    it('활성 구독이 있으면 반환한다', () => {
      const mockDb = createMockDb();
      mockDb._get.mockReturnValue({
        id: 1,
        user_id: 42,
        plan: 'monthly',
        status: 'active',
        start_date: '2026-01-01',
        end_date: '2026-12-31',
        created_at: '2026-01-01T00:00:00.000Z',
      });
      mockGetDatabase.mockReturnValue(mockDb as any);

      const sub = checkSubscription(42);

      expect(sub).not.toBeNull();
      expect(sub!.userId).toBe(42);
      expect(sub!.plan).toBe('monthly');
      expect(sub!.status).toBe('active');
    });

    it('활성 구독이 없으면 null을 반환한다', () => {
      const mockDb = createMockDb();
      mockDb._get.mockReturnValue(undefined);
      mockGetDatabase.mockReturnValue(mockDb as any);

      const sub = checkSubscription(42);

      expect(sub).toBeNull();
    });
  });

  describe('createSubscription', () => {
    it('월간 구독을 생성한다', () => {
      const mockDb = createMockDb();
      mockGetDatabase.mockReturnValue(mockDb as any);

      const sub = createSubscription(42, 'monthly');

      expect(sub.userId).toBe(42);
      expect(sub.plan).toBe('monthly');
      expect(sub.status).toBe('active');
      expect(mockDb._run).toHaveBeenCalled();
    });

    it('연간 구독을 생성한다', () => {
      const mockDb = createMockDb();
      mockGetDatabase.mockReturnValue(mockDb as any);

      const sub = createSubscription(42, 'yearly');

      expect(sub.plan).toBe('yearly');
    });
  });

  describe('cancelSubscription', () => {
    it('활성 구독을 취소한다', () => {
      const mockDb = createMockDb();
      mockDb._run.mockReturnValue({ changes: 1 });
      mockGetDatabase.mockReturnValue(mockDb as any);

      const result = cancelSubscription(42);

      expect(result).toBe(true);
    });

    it('활성 구독이 없으면 false를 반환한다', () => {
      const mockDb = createMockDb();
      mockDb._run.mockReturnValue({ changes: 0 });
      mockGetDatabase.mockReturnValue(mockDb as any);

      const result = cancelSubscription(42);

      expect(result).toBe(false);
    });
  });
});
