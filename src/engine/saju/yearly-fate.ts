import type { GanJi } from '../types/index.js';
import { getStemByIndex } from '../core/heavenly-stems.js';
import { getBranchByIndex } from '../core/earthly-branches.js';

/**
 * 세운(歲運) 계산 - 특정 연도의 간지
 *
 * 년간 공식: (year - 4) % 10 → 천간 인덱스
 * 년지 공식: (year - 4) % 12 → 지지 인덱스
 */
export function calculateYearlyFate(year: number): GanJi {
  const stemIndex = ((year - 4) % 10 + 10) % 10;
  const branchIndex = ((year - 4) % 12 + 12) % 12;
  return {
    stem: getStemByIndex(stemIndex),
    branch: getBranchByIndex(branchIndex),
  };
}

/**
 * 여러 연도의 세운을 한번에 계산
 */
export function calculateYearlyFateRange(
  startYear: number,
  endYear: number,
): Array<{ year: number; ganJi: GanJi }> {
  const results: Array<{ year: number; ganJi: GanJi }> = [];
  for (let year = startYear; year <= endYear; year++) {
    results.push({ year, ganJi: calculateYearlyFate(year) });
  }
  return results;
}
