import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/db/connection.js', () => ({
  getDatabase: vi.fn(),
}));

import { processPayment, verifyPayment } from '@/services/payment.js';
import { getDatabase } from '@/db/connection.js';

const mockGetDatabase = vi.mocked(getDatabase);

function createMockDb() {
  const mockRun = vi.fn().mockReturnValue({ lastInsertRowid: 1, changes: 1 });
  const mockGet = vi.fn();
  const mockPrepare = vi.fn().mockReturnValue({ run: mockRun, get: mockGet });
  return { prepare: mockPrepare, _run: mockRun, _get: mockGet };
}

describe('payment 서비스', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('processPayment', () => {
    it('Mock 결제를 처리하고 항상 completed를 반환한다', () => {
      const mockDb = createMockDb();
      mockGetDatabase.mockReturnValue(mockDb as any);

      const result = processPayment(42, 9900);

      expect(result.userId).toBe(42);
      expect(result.amount).toBe(9900);
      expect(result.status).toBe('completed');
      expect(result.provider).toBe('toss');
      expect(result.providerPaymentId).toMatch(/^mock_/);
    });

    it('provider를 지정할 수 있다', () => {
      const mockDb = createMockDb();
      mockGetDatabase.mockReturnValue(mockDb as any);

      const result = processPayment(42, 99000, 'kakao');

      expect(result.provider).toBe('kakao');
    });
  });

  describe('verifyPayment', () => {
    it('completed 결제를 검증하면 true를 반환한다', () => {
      const mockDb = createMockDb();
      mockDb._get.mockReturnValue({ status: 'completed' });
      mockGetDatabase.mockReturnValue(mockDb as any);

      expect(verifyPayment(1)).toBe(true);
    });

    it('존재하지 않는 결제를 검증하면 false를 반환한다', () => {
      const mockDb = createMockDb();
      mockDb._get.mockReturnValue(undefined);
      mockGetDatabase.mockReturnValue(mockDb as any);

      expect(verifyPayment(999)).toBe(false);
    });
  });
});
