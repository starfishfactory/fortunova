import type { HeavenlyStem, FiveElement, YinYang } from '../types/index.js';

/** 천간 10개 배열 (갑~계) */
export const HEAVENLY_STEMS: readonly HeavenlyStem[] = [
  '갑', '을', '병', '정', '무', '기', '경', '신', '임', '계',
] as const;

const STEM_ELEMENT_MAP: Record<HeavenlyStem, FiveElement> = {
  '갑': '목', '을': '목',
  '병': '화', '정': '화',
  '무': '토', '기': '토',
  '경': '금', '신': '금',
  '임': '수', '계': '수',
};

const STEM_YINYANG_MAP: Record<HeavenlyStem, YinYang> = {
  '갑': '양', '을': '음',
  '병': '양', '정': '음',
  '무': '양', '기': '음',
  '경': '양', '신': '음',
  '임': '양', '계': '음',
};

/** 천간 → 오행 */
export function getStemElement(stem: HeavenlyStem): FiveElement {
  return STEM_ELEMENT_MAP[stem];
}

/** 천간 → 음양 */
export function getStemYinYang(stem: HeavenlyStem): YinYang {
  return STEM_YINYANG_MAP[stem];
}

/** 천간 → 인덱스 (0-9) */
export function getStemIndex(stem: HeavenlyStem): number {
  return HEAVENLY_STEMS.indexOf(stem);
}

/** 인덱스 → 천간 (모듈러 연산) */
export function getStemByIndex(index: number): HeavenlyStem {
  return HEAVENLY_STEMS[((index % 10) + 10) % 10];
}
