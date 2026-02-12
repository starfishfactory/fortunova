import type { BirthInput, FourPillars, HeavenlyStem, EarthlyBranch } from '@/engine/types/index.js';

/**
 * 검증된 사주 케이스 인터페이스
 *
 * 율리우스 적일(JD) 기반 알고리즘으로 계산 후,
 * 만세력닷컴, 더큼만세력, 척척만세력 교차 검증된 데이터
 */
export interface KnownSajuCase {
  /** 케이스 ID */
  id: string;
  /** 케이스 설명 */
  description: string;
  /** 카테고리: 경계 조건 분류 */
  category: 'general' | 'ipchun' | 'solar-term' | 'midnight' | 'leap-month' | 'year-boundary' | 'data-boundary';
  /** 입력 데이터 */
  input: BirthInput;
  /** 기대하는 사주팔자 결과 */
  expected: FourPillars;
}

/** 간지 헬퍼 */
function gj(stem: HeavenlyStem, branch: EarthlyBranch) {
  return { stem, branch };
}

/**
 * 교차 검증된 사주 정답 데이터
 *
 * Phase 1-1: 초기 10개 케이스
 * Phase 1-4: 알고리즘 검증 기반 교정
 * TODO: 50+개로 확장 (전체 카테고리 충족)
 */
export const KNOWN_SAJU_CASES: KnownSajuCase[] = [
  // === 일반 케이스 ===
  {
    id: 'general-001',
    description: '1990년 5월 15일 14시 남성 (양력)',
    category: 'general',
    input: {
      year: 1990, month: 5, day: 15, hour: 14,
      isLunar: false, isLeapMonth: false, gender: 'M',
    },
    expected: {
      year: gj('경', '오'),
      month: gj('신', '사'),
      day: gj('경', '진'),
      hour: gj('계', '미'),
    },
  },
  {
    id: 'general-002',
    description: '1985년 10월 1일 8시 여성 (양력)',
    category: 'general',
    input: {
      year: 1985, month: 10, day: 1, hour: 8,
      isLunar: false, isLeapMonth: false, gender: 'F',
    },
    expected: {
      year: gj('을', '축'),
      month: gj('을', '유'),
      day: gj('계', '유'),
      hour: gj('병', '진'),
    },
  },
  {
    id: 'general-003',
    description: '2000년 1월 1일 12시 남성 (양력)',
    category: 'general',
    input: {
      year: 2000, month: 1, day: 1, hour: 12,
      isLunar: false, isLeapMonth: false, gender: 'M',
    },
    expected: {
      year: gj('기', '묘'),   // 입춘 전이므로 1999년(기묘년)
      month: gj('병', '자'),
      day: gj('무', '오'),
      hour: gj('무', '오'),
    },
  },

  // === 입춘 경계 케이스 ===
  {
    id: 'ipchun-001',
    description: '2024년 2월 3일 입춘 전 (양력) - 아직 계묘년',
    category: 'ipchun',
    input: {
      year: 2024, month: 2, day: 3, hour: 10,
      isLunar: false, isLeapMonth: false, gender: 'M',
    },
    expected: {
      year: gj('계', '묘'),
      month: gj('을', '축'),
      day: gj('정', '유'),
      hour: gj('을', '사'),
    },
  },
  {
    id: 'ipchun-002',
    description: '2024년 2월 5일 입춘 후 (양력) - 갑진년 시작',
    category: 'ipchun',
    input: {
      year: 2024, month: 2, day: 5, hour: 10,
      isLunar: false, isLeapMonth: false, gender: 'F',
    },
    expected: {
      year: gj('갑', '진'),
      month: gj('병', '인'),
      day: gj('기', '해'),
      hour: gj('기', '사'),
    },
  },

  // === 야자시 케이스 ===
  {
    id: 'midnight-001',
    description: '1995년 7월 20일 23시 (야자시) - 남성',
    category: 'midnight',
    input: {
      year: 1995, month: 7, day: 20, hour: 23,
      isLunar: false, isLeapMonth: false, gender: 'M',
    },
    expected: {
      year: gj('을', '해'),
      month: gj('계', '미'),
      day: gj('임', '자'),
      hour: gj('경', '자'),
    },
  },

  // === 윤달 케이스 ===
  {
    id: 'leap-month-001',
    description: '2023년 음력 윤2월 15일 12시 여성 (양력 2023-04-05)',
    category: 'leap-month',
    input: {
      year: 2023, month: 2, day: 15, hour: 12,
      isLunar: true, isLeapMonth: true, gender: 'F',
    },
    expected: {
      year: gj('계', '묘'),
      month: gj('병', '진'),
      day: gj('계', '사'),
      hour: gj('무', '오'),
    },
  },

  // === 연말연시 경계 ===
  {
    id: 'year-boundary-001',
    description: '2023년 12월 31일 12시 남성 (양력)',
    category: 'year-boundary',
    input: {
      year: 2023, month: 12, day: 31, hour: 12,
      isLunar: false, isLeapMonth: false, gender: 'M',
    },
    expected: {
      year: gj('계', '묘'),
      month: gj('갑', '자'),
      day: gj('계', '해'),
      hour: gj('무', '오'),
    },
  },

  // === 데이터 경계 ===
  {
    id: 'data-boundary-001',
    description: '1950년 6월 25일 6시 남성 (양력, 한국전쟁 발발일)',
    category: 'data-boundary',
    input: {
      year: 1950, month: 6, day: 25, hour: 6,
      isLunar: false, isLeapMonth: false, gender: 'M',
    },
    expected: {
      year: gj('경', '인'),
      month: gj('임', '오'),
      day: gj('신', '묘'),
      hour: gj('신', '묘'),
    },
  },
  {
    id: 'data-boundary-002',
    description: '2050년 3월 15일 15시 여성 (양력)',
    category: 'data-boundary',
    input: {
      year: 2050, month: 3, day: 15, hour: 15,
      isLunar: false, isLeapMonth: false, gender: 'F',
    },
    expected: {
      year: gj('경', '오'),
      month: gj('기', '묘'),
      day: gj('갑', '오'),
      hour: gj('임', '신'),
    },
  },
];
