import type { HeavenlyStem, FiveElement, FourPillars } from '../types/index.js';
import type { TenGod } from '../types/analysis.js';
import { getStemElement, getStemYinYang } from '../core/heavenly-stems.js';
import { getBranchElement, getBranchYinYang } from '../core/earthly-branches.js';
import { getElementRelation } from '../core/five-elements.js';

/**
 * 일간과 대상 천간의 오행/음양 관계로 십신을 결정한다.
 *
 * 규칙:
 * - 비겁: 같은 오행 (같은 음양=비견, 다른 음양=겁재)
 * - 식상: 내가 생하는 오행 (같은 음양=식신, 다른 음양=상관)
 * - 재성: 내가 극하는 오행 (같은 음양=편재, 다른 음양=정재)
 * - 관성: 나를 극하는 오행 (같은 음양=편관, 다른 음양=정관)
 * - 인성: 나를 생하는 오행 (같은 음양=편인, 다른 음양=정인)
 */
export function getTenGod(dayStem: HeavenlyStem, targetStem: HeavenlyStem): TenGod {
  const dayElement = getStemElement(dayStem);
  const dayYinYang = getStemYinYang(dayStem);
  const targetElement = getStemElement(targetStem);
  const targetYinYang = getStemYinYang(targetStem);

  const samePolarity = dayYinYang === targetYinYang;

  return determineTenGod(dayElement, targetElement, samePolarity);
}

/**
 * 사주팔자의 각 위치(년간, 월간, 시간, 년지, 월지, 일지, 시지)에 대한 십신을 매핑한다.
 * 일간(dayStem) 자체는 매핑에 포함하지 않는다.
 * 지지는 본기 오행만 사용한다 (Phase 2 단순화).
 */
export function mapFourPillarsTenGods(fourPillars: FourPillars): Record<string, TenGod> {
  const dayStem = fourPillars.day.stem;
  const result: Record<string, TenGod> = {};

  // 천간 매핑 (일간 제외)
  result['yearStem'] = getTenGod(dayStem, fourPillars.year.stem);
  result['monthStem'] = getTenGod(dayStem, fourPillars.month.stem);
  result['hourStem'] = getTenGod(dayStem, fourPillars.hour.stem);

  // 지지 매핑 (본기 오행 + 음양 기준)
  const dayElement = getStemElement(dayStem);
  const dayYinYang = getStemYinYang(dayStem);

  const branches = [
    { key: 'yearBranch', branch: fourPillars.year.branch },
    { key: 'monthBranch', branch: fourPillars.month.branch },
    { key: 'dayBranch', branch: fourPillars.day.branch },
    { key: 'hourBranch', branch: fourPillars.hour.branch },
  ];

  for (const { key, branch } of branches) {
    const branchElement = getBranchElement(branch);
    const branchYinYang = getBranchYinYang(branch);
    const samePolarity = dayYinYang === branchYinYang;
    result[key] = determineTenGod(dayElement, branchElement, samePolarity);
  }

  return result;
}

/** 오행 관계 + 음양 동일 여부로 십신 결정 */
function determineTenGod(
  dayElement: FiveElement,
  targetElement: FiveElement,
  samePolarity: boolean,
): TenGod {
  // 같은 오행 → 비겁
  if (dayElement === targetElement) {
    return samePolarity ? '비견' : '겁재';
  }

  // 내가 생하는 오행 → 식상 (상생 순서: 목→화→토→금→수)
  const relation = getElementRelation(dayElement, targetElement);
  if (relation === '상생') {
    return samePolarity ? '식신' : '상관';
  }

  // 내가 극하는 오행 → 재성 (상극 순서: 목→토→수→화→금)
  if (relation === '상극') {
    return samePolarity ? '편재' : '정재';
  }

  // 나를 극하는 오행 → 관성
  const overcoming = getElementRelation(targetElement, dayElement);
  if (overcoming === '상극') {
    return samePolarity ? '편관' : '정관';
  }

  // 나를 생하는 오행 → 인성
  return samePolarity ? '편인' : '정인';
}
