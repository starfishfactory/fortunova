/**
 * 월주(月柱) 계산 모듈
 *
 * 절기월과 년간에 따라 월주를 결정한다.
 * - 월지: 절기월에 따른 지지 매핑
 * - 월간: 년간에 따른 오프셋 + 절기월로 계산
 */

import type { SolarDate, GanJi, HeavenlyStem } from '@/engine/types/index.js';
import { getStemByIndex, getBranchByIndex, getStemIndex } from '@/engine/core/index.js';
import { getMonthSolarTerm } from '@/engine/calendar/solar-terms.js';

/**
 * 절기월 → 지지 인덱스 매핑
 *
 * 절기월 1(축월) → 1(축), 2(인월) → 2(인), ..., 11(해월) → 11(해), 12(자월) → 0(자)
 */
function getMonthBranchIndex(solarTermMonth: number): number {
  return solarTermMonth % 12;
}

/**
 * 년간에 따른 월간 오프셋 계산
 *
 * 갑(0)/기(5) → 병인월 시작: stemOffset = 2
 * 을(1)/경(6) → 무인월 시작: stemOffset = 4
 * 병(2)/신(7) → 경인월 시작: stemOffset = 6
 * 정(3)/임(8) → 임인월 시작: stemOffset = 8
 * 무(4)/계(9) → 갑인월 시작: stemOffset = 0
 */
function getStemOffset(yearStem: HeavenlyStem): number {
  const stemIndex = getStemIndex(yearStem);
  return ((stemIndex % 5) * 2 + 2) % 10;
}

/**
 * 양력 날짜와 년간으로 월주를 계산한다
 *
 * - 절기월: getMonthSolarTerm으로 판별 (1-12)
 * - 월지: 절기월 매핑 (1→축, 2→인, ..., 12→자)
 * - 월간: 인월(2)부터의 순서 position으로 계산
 *   축월(1)은 연간 순환의 마지막 달 (position 11)
 */
export function calculateMonthPillar(solarDate: SolarDate, yearStem: HeavenlyStem): GanJi {
  const solarTermMonth = getMonthSolarTerm(solarDate);

  const branchIndex = getMonthBranchIndex(solarTermMonth);
  const branch = getBranchByIndex(branchIndex);

  const stemOffset = getStemOffset(yearStem);
  const position = (solarTermMonth - 2 + 12) % 12;
  const monthStemIndex = (stemOffset + position) % 10;
  const stem = getStemByIndex(monthStemIndex);

  return { stem, branch };
}
