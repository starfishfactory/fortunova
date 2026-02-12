import type { EarthlyBranch, FiveElement, YinYang } from '../types/index.js';

/** 지지 12개 배열 (자~해) */
export const EARTHLY_BRANCHES: readonly EarthlyBranch[] = [
  '자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해',
] as const;

const BRANCH_ELEMENT_MAP: Record<EarthlyBranch, FiveElement> = {
  '인': '목', '묘': '목',
  '사': '화', '오': '화',
  '신': '금', '유': '금',
  '해': '수', '자': '수',
  '축': '토', '진': '토', '미': '토', '술': '토',
};

const BRANCH_YINYANG_MAP: Record<EarthlyBranch, YinYang> = {
  '자': '양', '축': '음',
  '인': '양', '묘': '음',
  '진': '양', '사': '음',
  '오': '양', '미': '음',
  '신': '양', '유': '음',
  '술': '양', '해': '음',
};

const BRANCH_HOUR_MAP: Record<EarthlyBranch, [number, number]> = {
  '자': [23, 1],
  '축': [1, 3],
  '인': [3, 5],
  '묘': [5, 7],
  '진': [7, 9],
  '사': [9, 11],
  '오': [11, 13],
  '미': [13, 15],
  '신': [15, 17],
  '유': [17, 19],
  '술': [19, 21],
  '해': [21, 23],
};

/** 지지 → 오행 */
export function getBranchElement(branch: EarthlyBranch): FiveElement {
  return BRANCH_ELEMENT_MAP[branch];
}

/** 지지 → 음양 */
export function getBranchYinYang(branch: EarthlyBranch): YinYang {
  return BRANCH_YINYANG_MAP[branch];
}

/** 지지 → 인덱스 (0-11) */
export function getBranchIndex(branch: EarthlyBranch): number {
  return EARTHLY_BRANCHES.indexOf(branch);
}

/** 인덱스 → 지지 (모듈러 연산) */
export function getBranchByIndex(index: number): EarthlyBranch {
  return EARTHLY_BRANCHES[((index % 12) + 12) % 12];
}

/** 지지 → 시간 범위 [시작, 끝] */
export function getBranchHour(branch: EarthlyBranch): [number, number] {
  return BRANCH_HOUR_MAP[branch];
}

/** 시간(0-23) → 지지 */
export function getHourBranch(hour: number): EarthlyBranch {
  if (hour === 23 || hour === 0) return '자';
  const index = Math.floor((hour + 1) / 2);
  return EARTHLY_BRANCHES[index];
}
