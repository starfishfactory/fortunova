import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { FortuneSystem, FortuneResult, SystemAnalysis } from '@/fortune/types.js';
import type { BirthInput } from '@/engine/types/index.js';

// 외부 의존성 mock
vi.mock('@/services/llm.js', () => ({
  callClaude: vi.fn(),
}));

vi.mock('@/fortune/registry.js', () => {
  const systems = new Map();
  return {
    fortuneRegistry: {
      register(system: any) {
        systems.set(system.id, system);
      },
      get(id: string) {
        return systems.get(id);
      },
      has(id: string) {
        return systems.has(id);
      },
      getAll() {
        return Array.from(systems.values());
      },
      _clear() {
        systems.clear();
      },
    },
  };
});

vi.mock('@/db/connection.js', () => ({
  getDatabase: vi.fn(),
}));

import { getFortune } from '@/services/fortune.js';
import { callClaude } from '@/services/llm.js';
import { fortuneRegistry } from '@/fortune/registry.js';
import { getDatabase } from '@/db/connection.js';

const mockCallClaude = vi.mocked(callClaude);
const mockGetDatabase = vi.mocked(getDatabase);

const mockFortuneResult: FortuneResult = {
  summary: '오늘은 좋은 날입니다',
  detail: '상세한 운세 내용',
  score: 85,
  advice: '긍정적으로 생각하세요',
  luckyColor: '파랑',
  luckyNumber: 7,
};

const mockSystemAnalysis: SystemAnalysis = {
  systemId: 'saju',
  data: { fourPillars: '경오 신사 갑자 병인', dayMasterStrength: 'weak', todayElement: '목' },
};

const mockFortuneSystem: FortuneSystem = {
  id: 'saju',
  name: '사주/명리',
  requiredInput: [],
  analyze: vi.fn().mockResolvedValue(mockSystemAnalysis),
  buildPrompt: vi.fn().mockReturnValue('테스트 프롬프트'),
  parseResult: vi.fn().mockReturnValue(mockFortuneResult),
};

const mockInput: BirthInput = {
  year: 1990,
  month: 5,
  day: 15,
  hour: 14,
  isLunar: false,
  isLeapMonth: false,
  gender: 'M',
};

// DB mock helper
function createMockDb() {
  const mockRun = vi.fn().mockReturnValue({ changes: 1 });
  const mockGet = vi.fn();
  const mockPrepare = vi.fn().mockReturnValue({
    run: mockRun,
    get: mockGet,
  });

  return {
    prepare: mockPrepare,
    _run: mockRun,
    _get: mockGet,
  };
}

describe('getFortune', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (fortuneRegistry as any)._clear();
    fortuneRegistry.register(mockFortuneSystem);
  });

  it('캐시 히트 시 LLM을 호출하지 않는다', async () => {
    const cachedFortune = JSON.stringify(mockFortuneResult);
    const cachedRow = {
      fortune: cachedFortune,
      score: 85,
      saju_data: JSON.stringify({ fourPillars: '경오 신사 갑자 병인', dayMasterStrength: 'weak', todayElement: '목' }),
    };

    const mockDb = createMockDb();
    mockDb._get
      .mockReturnValueOnce(cachedRow)    // cache 조회 → 히트
      .mockReturnValueOnce({ count: 1 }); // usage 조회
    mockGetDatabase.mockReturnValue(mockDb as any);

    const result = await getFortune(mockInput, 'daily', 'saju');

    expect(result.cached).toBe(true);
    expect(result.fortune).toEqual(mockFortuneResult);
    expect(mockCallClaude).not.toHaveBeenCalled();
    expect(mockFortuneSystem.analyze).not.toHaveBeenCalled();
  });

  it('캐시 미스 시 전체 흐름이 동작한다', async () => {
    const mockDb = createMockDb();
    mockDb._get
      .mockReturnValueOnce(null)          // cache 조회 → 미스
      .mockReturnValueOnce({ count: 1 }); // usage 조회
    mockGetDatabase.mockReturnValue(mockDb as any);

    const llmResponse = JSON.stringify(mockFortuneResult);
    mockCallClaude.mockResolvedValue(llmResponse);

    const result = await getFortune(mockInput, 'daily', 'saju');

    expect(result.cached).toBe(false);
    expect(result.fortune).toEqual(mockFortuneResult);
    expect(mockFortuneSystem.analyze).toHaveBeenCalled();
    expect(mockFortuneSystem.buildPrompt).toHaveBeenCalledWith(mockSystemAnalysis, 'daily');
    expect(mockCallClaude).toHaveBeenCalledWith('테스트 프롬프트');
    expect(mockFortuneSystem.parseResult).toHaveBeenCalledWith(llmResponse);
  });

  it('캐시 미스 시 결과를 DB에 저장한다', async () => {
    const mockDb = createMockDb();
    mockDb._get
      .mockReturnValueOnce(null)          // cache 미스
      .mockReturnValueOnce({ count: 0 }); // usage 조회
    mockGetDatabase.mockReturnValue(mockDb as any);

    const llmResponse = JSON.stringify(mockFortuneResult);
    mockCallClaude.mockResolvedValue(llmResponse);

    await getFortune(mockInput, 'daily', 'saju');

    // fortune_cache INSERT와 daily_usage UPDATE가 호출됨
    const runCalls = mockDb._run.mock.calls;
    expect(runCalls.length).toBeGreaterThanOrEqual(2);
  });

  it('존재하지 않는 시스템 ID로 호출하면 에러를 던진다', async () => {
    await expect(getFortune(mockInput, 'daily', 'nonexistent'))
      .rejects.toThrow('지원하지 않는 운세 시스템');
  });

  it('남은 무료 횟수를 반환한다', async () => {
    const mockDb = createMockDb();
    mockDb._get
      .mockReturnValueOnce(null)   // cache 미스
      .mockReturnValueOnce(null);  // usage 없음 (첫 사용)
    mockGetDatabase.mockReturnValue(mockDb as any);

    const llmResponse = JSON.stringify(mockFortuneResult);
    mockCallClaude.mockResolvedValue(llmResponse);

    const result = await getFortune(mockInput, 'daily', 'saju');

    // dailyFreeLimit(3) - 사용 후 count(1) = 2
    expect(result.remainingFreeCount).toBe(2);
  });
});
