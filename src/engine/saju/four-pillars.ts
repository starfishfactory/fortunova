/**
 * 사주팔자(四柱八字) 통합 계산 모듈
 *
 * 년주, 월주, 일주, 시주를 계산하여 FourPillars를 반환한다.
 */

import type { FourPillars, BirthInput, SolarDate, GanJi } from '@/engine/types/index.js';
import { lunarToSolar } from '@/engine/calendar/lunar-converter.js';
import { calculateYearPillar } from './year-pillar.js';
import { calculateMonthPillar } from './month-pillar.js';
import { calculateDayPillar } from './day-pillar.js';
import { calculateHourPillar } from './hour-pillar.js';

/**
 * 생년월일시 입력으로 사주팔자를 계산한다
 *
 * 1. 음력이면 양력으로 변환
 * 2. 년주 계산 (입춘 기준)
 * 3. 월주 계산 (절기 기준)
 * 4. 일주 계산 (율리우스 적일 기반)
 * 5. 시주 계산 (일간 기준, 야자시/조자시)
 */
export function calculateFourPillars(input: BirthInput): FourPillars {
  // 1. 음력→양력 변환
  let solarDate: SolarDate;
  if (input.isLunar) {
    solarDate = lunarToSolar({
      year: input.year,
      month: input.month,
      day: input.day,
      isLeapMonth: input.isLeapMonth,
    });
  } else {
    solarDate = { year: input.year, month: input.month, day: input.day };
  }

  // 2. 년주 (입춘 기준 전환)
  const year = calculateYearPillar(solarDate);

  // 3. 월주 (절기 기준 전환)
  const month = calculateMonthPillar(solarDate, year.stem);

  // 4. 일주 (율리우스 적일)
  const day = calculateDayPillar(solarDate);

  // 5. 시주 (일간 기준, 야자시/조자시)
  let hour: GanJi;
  if (input.hour === null) {
    // 시간 미입력 시 자시(0시)로 기본 처리
    hour = calculateHourPillar(0, day.stem)!;
  } else {
    hour = calculateHourPillar(input.hour, day.stem)!;
  }

  return { year, month, day, hour };
}
