/**
 * 년주(年柱) 계산 모듈
 *
 * 입춘 기준으로 년주를 결정한다.
 * 입춘 전이면 전년도 기준, 입춘 후이면 해당 년도 기준.
 */

import type { SolarDate, GanJi } from '@/engine/types/index.js';
import { getStemByIndex, getBranchByIndex } from '@/engine/core/index.js';
import { isBeforeIpchun } from '@/engine/calendar/solar-terms.js';

/**
 * 양력 날짜로 년주를 계산한다
 *
 * - 입춘 전이면 전년도를 기준으로 계산
 * - 년간: (effectiveYear - 4) % 10
 * - 년지: (effectiveYear - 4) % 12
 */
export function calculateYearPillar(solarDate: SolarDate): GanJi {
  const effectiveYear = isBeforeIpchun(solarDate, solarDate.year)
    ? solarDate.year - 1
    : solarDate.year;

  const stem = getStemByIndex((effectiveYear - 4) % 10);
  const branch = getBranchByIndex((effectiveYear - 4) % 12);

  return { stem, branch };
}
