import type { FiveElement, FourPillars } from '../types/index.js';
import { getStemElement } from '../core/heavenly-stems.js';
import { getBranchElement } from '../core/earthly-branches.js';
import { FIVE_ELEMENTS } from '../core/five-elements.js';

/**
 * 사주 8글자(천간 4 + 지지 4)의 오행 비율을 계산한다.
 * 지지는 본기 오행만 사용한다 (Phase 2 단순화).
 *
 * @returns 각 오행의 비율 (0~1 사이, 합계 = 1)
 */
export function calculateElementBalance(fourPillars: FourPillars): Record<FiveElement, number> {
  const count: Record<FiveElement, number> = { '목': 0, '화': 0, '토': 0, '금': 0, '수': 0 };
  const total = 8; // 천간 4 + 지지 4

  // 천간 오행 카운트
  const stems = [
    fourPillars.year.stem,
    fourPillars.month.stem,
    fourPillars.day.stem,
    fourPillars.hour.stem,
  ];
  for (const stem of stems) {
    count[getStemElement(stem)]++;
  }

  // 지지 본기 오행 카운트
  const branches = [
    fourPillars.year.branch,
    fourPillars.month.branch,
    fourPillars.day.branch,
    fourPillars.hour.branch,
  ];
  for (const branch of branches) {
    count[getBranchElement(branch)]++;
  }

  // 비율 계산
  const result = {} as Record<FiveElement, number>;
  for (const element of FIVE_ELEMENTS) {
    result[element] = count[element] / total;
  }

  return result;
}
