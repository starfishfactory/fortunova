import type { FiveElement, FourPillars } from '../types/index.js';
import type { DayMasterStrength } from '../types/analysis.js';
import { getStemElement } from '../core/heavenly-stems.js';
import { getGeneratingElement, getOvercomingElement } from '../core/five-elements.js';
import { FIVE_ELEMENTS } from '../core/five-elements.js';

/**
 * 일간 강약 기반 용신(用神) 결정
 *
 * 규칙:
 * - 일간이 강(strong)하면 → 설기(泄氣)하는 오행이 용신
 *   - 식상(내가 생하는 오행), 재성(내가 극하는 오행), 관성(나를 극하는 오행) 중
 *   - 가장 부족한 오행을 용신으로 선택
 *
 * - 일간이 약(weak)하면 → 보강하는 오행이 용신
 *   - 비겁(같은 오행), 인성(나를 생하는 오행) 중
 *   - 가장 부족한 오행을 용신으로 선택
 *
 * - 중립(neutral)이면 → 오행 균형에서 가장 부족한 오행
 */
export function determineUsefulGod(
  fourPillars: FourPillars,
  elementBalance: Record<FiveElement, number>,
  dayMasterStrength: DayMasterStrength,
): FiveElement {
  const dayElement = getStemElement(fourPillars.day.stem);

  if (dayMasterStrength === 'strong') {
    return findUsefulGodForStrong(dayElement, elementBalance);
  }

  if (dayMasterStrength === 'weak') {
    return findUsefulGodForWeak(dayElement, elementBalance);
  }

  // neutral: 가장 부족한 오행
  return findMostDeficientElement(elementBalance);
}

/**
 * 신강(身强): 설기하는 오행 중 가장 부족한 것
 * - 식상: 내가 생하는 오행
 * - 재성: 내가 극하는 오행
 * - 관성: 나를 극하는 오행
 */
function findUsefulGodForStrong(
  dayElement: FiveElement,
  balance: Record<FiveElement, number>,
): FiveElement {
  // 상생 순서: 목→화→토→금→수
  const genOrder: FiveElement[] = ['목', '화', '토', '금', '수'];
  const dayIdx = genOrder.indexOf(dayElement);

  // 식상: 내가 생하는 오행 (상생 다음)
  const sikSang = genOrder[(dayIdx + 1) % 5];
  // 재성: 내가 극하는 오행
  const overcomingOrder: FiveElement[] = ['목', '토', '수', '화', '금'];
  const dayOverIdx = overcomingOrder.indexOf(dayElement);
  const jaeSeong = overcomingOrder[(dayOverIdx + 1) % 5];
  // 관성: 나를 극하는 오행
  const gwanSeong = getOvercomingElement(dayElement);

  const candidates: FiveElement[] = [sikSang, jaeSeong, gwanSeong];

  // 가장 부족한 오행
  return candidates.reduce((min, el) =>
    (balance[el] ?? 0) < (balance[min] ?? 0) ? el : min,
  );
}

/**
 * 신약(身弱): 보강하는 오행 중 가장 부족한 것
 * - 비겁: 같은 오행
 * - 인성: 나를 생하는 오행
 */
function findUsefulGodForWeak(
  dayElement: FiveElement,
  balance: Record<FiveElement, number>,
): FiveElement {
  const inSeong = getGeneratingElement(dayElement);

  // 비겁(같은 오행)과 인성 중 더 부족한 것
  return (balance[dayElement] ?? 0) <= (balance[inSeong] ?? 0)
    ? dayElement
    : inSeong;
}

/**
 * 중립: 전체 오행 중 가장 부족한 것
 */
function findMostDeficientElement(
  balance: Record<FiveElement, number>,
): FiveElement {
  return FIVE_ELEMENTS.reduce((min, el) =>
    (balance[el] ?? 0) < (balance[min] ?? 0) ? el : min,
  );
}
