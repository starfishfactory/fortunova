import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/db/connection.js', () => ({
  getDatabase: vi.fn(),
}));

import { createSharedFortune, getSharedFortune } from '@/services/share.js';
import { getDatabase } from '@/db/connection.js';

const mockGetDatabase = vi.mocked(getDatabase);

function createMockDb() {
  const mockRun = vi.fn().mockReturnValue({ lastInsertRowid: 1, changes: 1 });
  const mockGet = vi.fn();
  const mockPrepare = vi.fn().mockReturnValue({ run: mockRun, get: mockGet });
  return { prepare: mockPrepare, _run: mockRun, _get: mockGet };
}

const mockFortune = {
  summary: '좋은 하루',
  detail: '상세 설명',
  score: 85,
  advice: '조언',
};

const mockSajuSummary = {
  fourPillars: '경오 신사 갑자 병인',
  dayMasterStrength: 'weak',
  todayElement: '목',
};

describe('share 서비스', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createSharedFortune', () => {
    it('공유 운세를 생성하고 ID를 반환한다', () => {
      const mockDb = createMockDb();
      mockGetDatabase.mockReturnValue(mockDb as any);

      const result = createSharedFortune(mockFortune, mockSajuSummary, 'daily');

      expect(result.id).toHaveLength(16); // 8 bytes hex = 16 chars
      expect(result.fortune).toEqual(mockFortune);
      expect(result.category).toBe('daily');
      expect(mockDb._run).toHaveBeenCalled();
    });

    it('7일 후 만료일을 설정한다', () => {
      const mockDb = createMockDb();
      mockGetDatabase.mockReturnValue(mockDb as any);

      const result = createSharedFortune(mockFortune, mockSajuSummary, 'daily');

      const created = new Date(result.createdAt);
      const expires = new Date(result.expiresAt);
      const diffDays = (expires.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);

      expect(Math.round(diffDays)).toBe(7);
    });
  });

  describe('getSharedFortune', () => {
    it('유효한 공유 운세를 반환한다', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);

      const mockDb = createMockDb();
      mockDb._get.mockReturnValue({
        id: 'abc123',
        fortune: JSON.stringify(mockFortune),
        saju_summary: JSON.stringify(mockSajuSummary),
        category: 'daily',
        created_at: new Date().toISOString(),
        expires_at: futureDate.toISOString(),
      });
      mockGetDatabase.mockReturnValue(mockDb as any);

      const result = getSharedFortune('abc123');

      expect(result).not.toBeNull();
      expect(result!.fortune).toEqual(mockFortune);
      expect(result!.category).toBe('daily');
    });

    it('존재하지 않는 ID는 null을 반환한다', () => {
      const mockDb = createMockDb();
      mockDb._get.mockReturnValue(undefined);
      mockGetDatabase.mockReturnValue(mockDb as any);

      const result = getSharedFortune('nonexistent');

      expect(result).toBeNull();
    });

    it('만료된 공유 운세는 null을 반환한다', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const mockDb = createMockDb();
      mockDb._get.mockReturnValue({
        id: 'expired',
        fortune: JSON.stringify(mockFortune),
        saju_summary: JSON.stringify(mockSajuSummary),
        category: 'daily',
        created_at: new Date().toISOString(),
        expires_at: pastDate.toISOString(),
      });
      mockGetDatabase.mockReturnValue(mockDb as any);

      const result = getSharedFortune('expired');

      expect(result).toBeNull();
    });
  });
});
