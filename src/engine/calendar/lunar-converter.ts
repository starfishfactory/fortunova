/**
 * 양음력 변환 모듈
 *
 * 한국 시헌력 기반 양력↔음력 변환
 * 절대 일수(absolute days) 기반 알고리즘
 */

import type { SolarDate, LunarDate } from '@/engine/types/index.js';
import { LUNAR_YEAR_DATA, getLunarMonthDays } from '@/engine/data/lunar-data.js';

/**
 * 양력 날짜를 절대 일수로 변환 (율리우스 적일 기반)
 */
function solarToAbsDays(solar: SolarDate): number {
  const { year: y, month: m, day: d } = solar;
  // 그레고리력 율리우스 적일 공식 (간략판)
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
}

/**
 * 절대 일수를 양력 날짜로 변환
 */
function absDaysToSolar(jd: number): SolarDate {
  // 그레고리력 역변환 공식
  const a = jd + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor(146097 * b / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor(1461 * d / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = 100 * b + d - 4800 + Math.floor(m / 10);
  return { year, month, day };
}

/**
 * 음력 월 순회를 위한 이터레이터
 * (year, month, isLeapMonth) 순서로 순회한다
 */
function* lunarMonths(startYear: number, startMonth: number): Generator<[number, number, boolean]> {
  let year = startYear;
  let month = startMonth;
  let isLeap = false;

  while (true) {
    yield [year, month, isLeap];

    const info = LUNAR_YEAR_DATA[year];
    if (!isLeap && info && info.leapMonth === month) {
      // 현재 평달이고 이 달에 윤달이 있으면 다음은 윤달
      isLeap = true;
    } else {
      isLeap = false;
      month++;
      if (month > 12) {
        month = 1;
        year++;
      }
    }
  }
}

/**
 * 기준점: 음력 1949-11-01 = 양력 1949-12-20
 * (이 앵커 포인트를 기준으로 일수를 계산)
 */
const ANCHOR_SOLAR: SolarDate = { year: 1949, month: 12, day: 20 };
const ANCHOR_LUNAR_YEAR = 1949;
const ANCHOR_LUNAR_MONTH = 11;
const ANCHOR_LUNAR_DAY = 1;
const ANCHOR_ABS_DAYS = solarToAbsDays(ANCHOR_SOLAR);

/**
 * 양력 날짜를 음력 날짜로 변환한다
 */
export function solarToLunar(solar: SolarDate): LunarDate {
  const targetDays = solarToAbsDays(solar);
  let remainDays = targetDays - ANCHOR_ABS_DAYS;

  if (remainDays < 0) {
    throw new Error('1949년 11월 이전 음력 날짜는 지원하지 않습니다');
  }

  const iter = lunarMonths(ANCHOR_LUNAR_YEAR, ANCHOR_LUNAR_MONTH);

  for (const [year, month, isLeap] of iter) {
    const monthDays = getLunarMonthDays(year, month, isLeap);
    if (remainDays < monthDays) {
      return {
        year,
        month,
        day: remainDays + ANCHOR_LUNAR_DAY,
        isLeapMonth: isLeap,
      };
    }
    remainDays -= monthDays;
  }

  throw new Error('변환할 수 없는 날짜입니다');
}

/**
 * 음력 날짜를 양력 날짜로 변환한다
 */
export function lunarToSolar(lunar: LunarDate): SolarDate {
  // 앵커에서 목표 음력까지의 일수 계산
  let days = 0;
  const iter = lunarMonths(ANCHOR_LUNAR_YEAR, ANCHOR_LUNAR_MONTH);

  for (const [year, month, isLeap] of iter) {
    if (year === lunar.year && month === lunar.month && isLeap === lunar.isLeapMonth) {
      days += lunar.day - ANCHOR_LUNAR_DAY;
      break;
    }
    days += getLunarMonthDays(year, month, isLeap);
  }

  return absDaysToSolar(ANCHOR_ABS_DAYS + days);
}
