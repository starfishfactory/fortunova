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

// buildChunkPrompts와 mergeChunkResults mock
vi.mock('@/fortune/systems/saju-system.js', () => ({
  buildChunkPrompts: vi.fn().mockReturnValue({
    core: 'core prompt',
    sub: 'sub prompt',
    meta: 'meta prompt',
  }),
  mergeChunkResults: vi.fn(),
  buildCritiquePrompt: vi.fn().mockReturnValue('critique prompt'),
  parseCritiqueResult: vi.fn().mockReturnValue({ score: 8, feedback: '', shouldRegenerate: false }),
  buildEnhancedCorePrompt: vi.fn().mockReturnValue('enhanced core prompt'),
  sajuSystem: {
    id: 'saju',
    name: '사주/명리',
    requiredInput: [],
    analyze: vi.fn(),
    buildPrompt: vi.fn(),
    parseResult: vi.fn(),
  },
}));

import { getFortune } from '@/services/fortune.js';
import { callClaude } from '@/services/llm.js';
import { fortuneRegistry } from '@/fortune/registry.js';
import { getDatabase } from '@/db/connection.js';
import { mergeChunkResults } from '@/fortune/systems/saju-system.js';

const mockCallClaude = vi.mocked(callClaude);
const mockGetDatabase = vi.mocked(getDatabase);
const mockMergeChunkResults = vi.mocked(mergeChunkResults);

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
  data: {
    fourPillars: {
      year: { stem: '경', branch: '오' },
      month: { stem: '신', branch: '사' },
      day: { stem: '갑', branch: '자' },
      hour: { stem: '병', branch: '인' },
    },
    dayMasterStrength: 'weak',
    usefulGod: '목',
  },
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
    mockMergeChunkResults.mockReturnValue(mockFortuneResult);
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

    const result = await getFortune(mockInput, 'daily', 'saju', 'user:1', 'user');

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
    const critiqueResponse = JSON.stringify({ score: 8, feedback: 'good' });
    mockCallClaude
      .mockResolvedValueOnce(llmResponse)  // core chunk
      .mockResolvedValueOnce(llmResponse)  // sub chunk
      .mockResolvedValueOnce(llmResponse)  // meta chunk
      .mockResolvedValueOnce(critiqueResponse); // critique (score >= 7 → no retry)

    const result = await getFortune(mockInput, 'daily', 'saju', 'anon:abc123', 'anonymous');

    expect(result.cached).toBe(false);
    expect(result.fortune).toEqual(mockFortuneResult);
    expect(mockFortuneSystem.analyze).toHaveBeenCalled();
    // 3청크 병렬 + 1 비평 = 4회 호출
    expect(mockCallClaude).toHaveBeenCalledTimes(4);
    expect(mockMergeChunkResults).toHaveBeenCalled();
  });

  it('캐시 미스 시 결과를 DB에 저장한다', async () => {
    const mockDb = createMockDb();
    mockDb._get
      .mockReturnValueOnce(null)          // cache 미스
      .mockReturnValueOnce({ count: 0 }); // usage 조회
    mockGetDatabase.mockReturnValue(mockDb as any);

    const llmResponse = JSON.stringify(mockFortuneResult);
    const critiqueResponse = JSON.stringify({ score: 9, feedback: '' });
    mockCallClaude.mockResolvedValue(llmResponse);
    // 4번째 호출(비평)만 비평 응답 반환
    mockCallClaude.mockResolvedValueOnce(llmResponse)
      .mockResolvedValueOnce(llmResponse)
      .mockResolvedValueOnce(llmResponse)
      .mockResolvedValueOnce(critiqueResponse);

    await getFortune(mockInput, 'daily', 'saju', 'user:1', 'user');

    // fortune_cache INSERT와 daily_usage UPDATE가 호출됨
    const runCalls = mockDb._run.mock.calls;
    expect(runCalls.length).toBeGreaterThanOrEqual(2);
  });

  it('존재하지 않는 시스템 ID로 호출하면 에러를 던진다', async () => {
    await expect(getFortune(mockInput, 'daily', 'nonexistent', 'user:1', 'user'))
      .rejects.toThrow('지원하지 않는 운세 시스템');
  });

  it('남은 무료 횟수를 반환한다', async () => {
    const mockDb = createMockDb();
    mockDb._get
      .mockReturnValueOnce(null)   // cache 미스
      .mockReturnValueOnce(null);  // usage 없음 (첫 사용)
    mockGetDatabase.mockReturnValue(mockDb as any);

    const llmResponse = JSON.stringify(mockFortuneResult);
    const critiqueResponse = JSON.stringify({ score: 8, feedback: '' });
    mockCallClaude
      .mockResolvedValueOnce(llmResponse)
      .mockResolvedValueOnce(llmResponse)
      .mockResolvedValueOnce(llmResponse)
      .mockResolvedValueOnce(critiqueResponse);

    const result = await getFortune(mockInput, 'daily', 'saju', 'anon:xyz', 'anonymous');

    // dailyFreeLimit(3) - 사용 후 count(1) = 2
    expect(result.remainingFreeCount).toBe(2);
  });

  it('identifier별로 사용량을 추적한다', async () => {
    const mockDb = createMockDb();
    mockDb._get
      .mockReturnValueOnce(null)    // cache 미스
      .mockReturnValueOnce(null);   // usage 없음
    mockGetDatabase.mockReturnValue(mockDb as any);

    const llmResponse = JSON.stringify(mockFortuneResult);
    const critiqueResponse = JSON.stringify({ score: 8, feedback: '' });
    mockCallClaude
      .mockResolvedValueOnce(llmResponse)
      .mockResolvedValueOnce(llmResponse)
      .mockResolvedValueOnce(llmResponse)
      .mockResolvedValueOnce(critiqueResponse);

    await getFortune(mockInput, 'daily', 'saju', 'user:42', 'user');

    // daily_usage INSERT에 identifier가 'user:42'로 들어감
    const runCalls = mockDb._run.mock.calls;
    const insertCall = runCalls.find((call: any[]) =>
      call[0] === 'user:42' && call[1] === 'user',
    );
    expect(insertCall).toBeTruthy();
  });
});
