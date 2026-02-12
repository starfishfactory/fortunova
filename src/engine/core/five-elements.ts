import type { FiveElement, ElementRelation } from '../types/index.js';

/** 오행 5개 배열 */
export const FIVE_ELEMENTS: readonly FiveElement[] = ['목', '화', '토', '금', '수'] as const;

/** 상생 순서: 목→화→토→금→수→목 */
const GENERATING_ORDER: FiveElement[] = ['목', '화', '토', '금', '수'];

/** 상극 순서: 목→토→수→화→금→목 */
const OVERCOMING_ORDER: FiveElement[] = ['목', '토', '수', '화', '금'];

/** 오행 관계 판별 */
export function getElementRelation(from: FiveElement, to: FiveElement): ElementRelation {
  if (from === to) return '비화';

  const fromGenIdx = GENERATING_ORDER.indexOf(from);
  const toGenIdx = GENERATING_ORDER.indexOf(to);
  if ((fromGenIdx + 1) % 5 === toGenIdx) return '상생';

  const fromOverIdx = OVERCOMING_ORDER.indexOf(from);
  const toOverIdx = OVERCOMING_ORDER.indexOf(to);
  if ((fromOverIdx + 1) % 5 === toOverIdx) return '상극';

  return '무관';
}

/** 나를 생하는 오행 (인성) */
export function getGeneratingElement(element: FiveElement): FiveElement {
  const idx = GENERATING_ORDER.indexOf(element);
  return GENERATING_ORDER[(idx - 1 + 5) % 5];
}

/** 나를 극하는 오행 (관성) */
export function getOvercomingElement(element: FiveElement): FiveElement {
  const idx = OVERCOMING_ORDER.indexOf(element);
  return OVERCOMING_ORDER[(idx - 1 + 5) % 5];
}
