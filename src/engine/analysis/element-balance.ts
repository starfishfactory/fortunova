import type { FiveElement, FourPillars } from '../types/index.js';
import { getStemElement } from '../core/heavenly-stems.js';
import { getHiddenStems } from '../core/earthly-branches.js';
import { FIVE_ELEMENTS } from '../core/five-elements.js';

/**
 * 사주 8글자(천간 4 + 지지 4)의 오행 비율을 계산한다.
 * 지지는 장간(藏干) 가중치를 적용한다.
 * - 본기(main): 장간 1개=1.0, 2개=0.7, 3개=0.6
 * - 중기(middle): 0.3
 * - 여기(residual): 0.1
 * 천간 4개(각 1.0) + 지지 4개(장간 가중치) → 총합 8.0으로 정규화
 *
 * @returns 각 오행의 비율 (0~1 사이, 합계 = 1)
 */
export function calculateElementBalance(fourPillars: FourPillars): Record<FiveElement, number> {
  const score: Record<FiveElement, number> = { '목': 0, '화': 0, '토': 0, '금': 0, '수': 0 };
  const total = 8; // 천간 4 × 1.0 + 지지 4 × 1.0 = 8.0

  // 천간 오행 카운트 (각 1.0)
  const stems = [
    fourPillars.year.stem,
    fourPillars.month.stem,
    fourPillars.day.stem,
    fourPillars.hour.stem,
  ];
  for (const stem of stems) {
    score[getStemElement(stem)] += 1.0;
  }

  // 지지 장간 가중치 적용
  const branches = [
    fourPillars.year.branch,
    fourPillars.month.branch,
    fourPillars.day.branch,
    fourPillars.hour.branch,
  ];
  for (const branch of branches) {
    const hidden = getHiddenStems(branch);
    const stemCount = 1 + (hidden.middle ? 1 : 0) + (hidden.residual ? 1 : 0);

    // 본기 가중치: 1개=1.0, 2개=0.7, 3개=0.6
    const mainWeight = stemCount === 1 ? 1.0 : stemCount === 2 ? 0.7 : 0.6;
    score[getStemElement(hidden.main)] += mainWeight;

    // 중기
    if (hidden.middle) {
      score[getStemElement(hidden.middle)] += 0.3;
    }

    // 여기
    if (hidden.residual) {
      score[getStemElement(hidden.residual)] += 0.1;
    }
  }

  // 비율 계산
  const result = {} as Record<FiveElement, number>;
  for (const element of FIVE_ELEMENTS) {
    result[element] = score[element] / total;
  }

  return result;
}
