import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/db/connection.js', () => ({
  getDatabase: vi.fn(),
}));

import {
  MockPaymentGateway,
  createPaymentRecord,
  confirmPaymentAndActivate,
  getPaymentsByUser,
} from '@/services/payment.js';
import { getDatabase } from '@/db/connection.js';

const mockGetDatabase = vi.mocked(getDatabase);

function createMockDb() {
  const mockRun = vi.fn().mockReturnValue({ lastInsertRowid: 1, changes: 1 });
  const mockGet = vi.fn();
  const mockAll = vi.fn().mockReturnValue([]);
  const mockPrepare = vi.fn().mockReturnValue({ run: mockRun, get: mockGet, all: mockAll });
  const mockTransaction = vi.fn((fn: any) => fn);
  return { prepare: mockPrepare, transaction: mockTransaction, _run: mockRun, _get: mockGet, _all: mockAll };
}

describe('payment 서비스', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('MockPaymentGateway', () => {
    it('결제를 생성한다', async () => {
      const gateway = new MockPaymentGateway();
      const result = await gateway.createPayment(9900, 'order-123');

      expect(result.success).toBe(true);
      expect(result.paymentKey).toBeTruthy();
      expect(result.orderId).toBe('order-123');
    });

    it('결제를 확인한다', async () => {
      const gateway = new MockPaymentGateway();
      const result = await gateway.confirmPayment('pk-123', 'order-123', 9900);

      expect(result.success).toBe(true);
      expect(result.paymentKey).toBe('pk-123');
      expect(result.approvedAt).toBeTruthy();
    });
  });

  describe('createPaymentRecord', () => {
    it('결제 레코드를 생성한다', () => {
      const mockDb = createMockDb();
      mockGetDatabase.mockReturnValue(mockDb as any);

      const result = createPaymentRecord(1, 9900, 'toss');

      expect(result.id).toBe(1);
      expect(result.userId).toBe(1);
      expect(result.amount).toBe(9900);
      expect(result.status).toBe('pending');
      expect(result.provider).toBe('toss');
    });
  });

  describe('confirmPaymentAndActivate', () => {
    it('결제 확인 후 구독을 활성화한다', () => {
      const mockRun = vi.fn()
        .mockReturnValueOnce({ changes: 1 }) // update payment
        .mockReturnValueOnce({ lastInsertRowid: 10, changes: 1 }); // insert subscription
      const mockGet = vi.fn();
      const mockAll = vi.fn().mockReturnValue([]);
      const mockPrepare = vi.fn().mockReturnValue({ run: mockRun, get: mockGet, all: mockAll });
      const mockTransaction = vi.fn((fn: any) => fn);
      const mockDb = { prepare: mockPrepare, transaction: mockTransaction, _run: mockRun, _get: mockGet, _all: mockAll };

      // First get: payment record
      mockGet.mockReturnValueOnce({
        id: 1,
        user_id: 42,
        amount: 9900,
        status: 'pending',
        provider: 'toss',
        provider_payment_id: null,
        created_at: new Date().toISOString(),
      });
      mockGetDatabase.mockReturnValue(mockDb as any);

      const result = confirmPaymentAndActivate(1, 42, 'monthly', 'pk-123');

      expect(result.payment.status).toBe('completed');
      expect(result.subscription.plan).toBe('monthly');
      expect(result.subscription.status).toBe('active');
    });

    it('결제가 존재하지 않으면 에러를 던진다', () => {
      const mockDb = createMockDb();
      mockDb._get.mockReturnValue(undefined);
      mockGetDatabase.mockReturnValue(mockDb as any);

      expect(() => confirmPaymentAndActivate(999, 42, 'monthly', 'pk-123'))
        .toThrow('PAYMENT_NOT_FOUND');
    });

    it('다른 사용자의 결제를 확인하면 에러를 던진다', () => {
      const mockDb = createMockDb();
      mockDb._get.mockReturnValue({
        id: 1,
        user_id: 99, // different user
        amount: 9900,
        status: 'pending',
        provider: 'toss',
      });
      mockGetDatabase.mockReturnValue(mockDb as any);

      expect(() => confirmPaymentAndActivate(1, 42, 'monthly', 'pk-123'))
        .toThrow('PAYMENT_NOT_FOUND');
    });

    it('이미 완료된 결제면 에러를 던진다', () => {
      const mockDb = createMockDb();
      mockDb._get.mockReturnValue({
        id: 1,
        user_id: 42,
        amount: 9900,
        status: 'completed',
        provider: 'toss',
      });
      mockGetDatabase.mockReturnValue(mockDb as any);

      expect(() => confirmPaymentAndActivate(1, 42, 'monthly', 'pk-123'))
        .toThrow('PAYMENT_ALREADY_PROCESSED');
    });
  });

  describe('getPaymentsByUser', () => {
    it('사용자의 결제 내역을 반환한다', () => {
      const mockDb = createMockDb();
      const now = new Date().toISOString();
      mockDb._all.mockReturnValue([
        { id: 1, user_id: 42, amount: 9900, status: 'completed', provider: 'toss', provider_payment_id: 'pk-1', created_at: now },
        { id: 2, user_id: 42, amount: 99000, status: 'pending', provider: 'kakao', provider_payment_id: null, created_at: now },
      ]);
      mockGetDatabase.mockReturnValue(mockDb as any);

      const result = getPaymentsByUser(42);

      expect(result).toHaveLength(2);
      expect(result[0].userId).toBe(42);
      expect(result[0].amount).toBe(9900);
      expect(result[1].amount).toBe(99000);
    });

    it('결제 내역이 없으면 빈 배열을 반환한다', () => {
      const mockDb = createMockDb();
      mockDb._all.mockReturnValue([]);
      mockGetDatabase.mockReturnValue(mockDb as any);

      const result = getPaymentsByUser(42);

      expect(result).toEqual([]);
    });
  });
});
