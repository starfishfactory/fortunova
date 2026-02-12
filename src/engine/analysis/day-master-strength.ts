import type { FiveElement, FourPillars } from '../types/index.js';
import type { DayMasterStrength } from '../types/analysis.js';
import { getStemElement } from '../core/heavenly-stems.js';
import { getBranchElement } from '../core/earthly-branches.js';
import { getElementRelation, getGeneratingElement } from '../core/five-elements.js';

/**
 * 오행 균형과 계절(월지)을 고려하여 일간의 강약을 판별한다.
 *
 * 판별 기준:
 * 1. 득령 여부: 월지 오행이 일간 오행과 같거나 생하면 득령 (+가산점)
 * 2. 비겁/인성 비율 vs 재성/관성/식상 비율
 *
 * @returns 'strong' | 'weak' | 'neutral'
 */
export function determineDayMasterStrength(
  fourPillars: FourPillars,
  elementBalance: Record<FiveElement, number>,
): DayMasterStrength {
  const dayElement = getStemElement(fourPillars.day.stem);
  const monthBranchElement = getBranchElement(fourPillars.month.branch);

  // 1. 득령 판별: 월지가 일간과 같은 오행이거나, 일간을 생하는 오행
  const hasSeasonSupport = isDeungRyeong(dayElement, monthBranchElement);

  // 2. 오행 균형 기반 점수 계산
  // 비겁(같은 오행) + 인성(나를 생하는 오행) = 도움 세력
  const helpingElement = getGeneratingElement(dayElement); // 인성 오행
  const helpingScore = (elementBalance[dayElement] ?? 0) + (elementBalance[helpingElement] ?? 0);

  // 재성 + 관성 + 식상 = 소모 세력
  const drainingScore = 1.0 - helpingScore;

  // 3. 득령 가산점 (±0.1)
  const seasonBonus = hasSeasonSupport ? 0.1 : -0.1;
  const adjustedHelping = helpingScore + seasonBonus;

  // 4. 판별
  const diff = adjustedHelping - drainingScore;

  if (diff > 0.15) return 'strong';
  if (diff < -0.15) return 'weak';
  return 'neutral';
}

/** 득령 판별: 월지 오행이 일간과 같거나 일간을 생하는 오행 */
function isDeungRyeong(dayElement: FiveElement, monthBranchElement: FiveElement): boolean {
  if (dayElement === monthBranchElement) return true;
  // 월지가 일간을 생하는 관계인지 (상생: from → to)
  return getElementRelation(monthBranchElement, dayElement) === '상생';
}
