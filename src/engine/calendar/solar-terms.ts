/**
 * 절기 기반 월 판별 모듈
 *
 * 24절기 데이터를 기반으로 절기월을 판별한다.
 * 절기월은 12절기(節氣) 기준으로 결정된다.
 */

import type { SolarDate, SolarTermName } from '@/engine/types/index.js';
import { SOLAR_TERMS_DATA, SOLAR_TERM_NAMES, MONTH_DIVIDING_TERM_INDICES } from '@/engine/data/solar-terms-data.js';

/**
 * 특정 년도의 절기 양력 날짜를 반환한다
 */
export function getSolarTermDate(year: number, termName: SolarTermName): SolarDate {
  const data = SOLAR_TERMS_DATA[year];
  if (!data) {
    throw new Error(`절기 데이터가 없는 년도입니다: ${year}`);
  }

  const index = SOLAR_TERM_NAMES.indexOf(termName);
  if (index === -1) {
    throw new Error(`알 수 없는 절기입니다: ${termName}`);
  }

  const mmdd = data[index];
  return {
    year,
    month: Math.floor(mmdd / 100),
    day: mmdd % 100,
  };
}

/**
 * MMDD 형식의 숫자로 날짜를 비교한다
 */
function toMMDD(date: SolarDate): number {
  return date.month * 100 + date.day;
}

/**
 * 월주 판별용 12절기와 절기월 매핑
 *
 * 소한(index 0) → 절기월 1 (축월)
 * 입춘(index 2) → 절기월 2 (인월)
 * 경칩(index 4) → 절기월 3 (묘월)
 * 청명(index 6) → 절기월 4 (진월)
 * 입하(index 8) → 절기월 5 (사월)
 * 망종(index 10) → 절기월 6 (오월)
 * 소서(index 12) → 절기월 7 (미월)
 * 입추(index 14) → 절기월 8 (신월)
 * 백로(index 16) → 절기월 9 (유월)
 * 한로(index 18) → 절기월 10 (술월)
 * 입동(index 20) → 절기월 11 (해월)
 * 대설(index 22) → 절기월 12 (자월)
 */

/**
 * 양력 날짜가 속한 절기월을 반환한다 (1-12)
 *
 * 절기월은 12절기 기준:
 * - 소한 ~ 입춘 전: 1월(축월)
 * - 입춘 ~ 경칩 전: 2월(인월)
 * - ...
 * - 대설 ~ 소한 전: 12월(자월)
 */
export function getMonthSolarTerm(date: SolarDate): number {
  const year = date.year;
  const mmdd = toMMDD(date);

  const data = SOLAR_TERMS_DATA[year];
  if (!data) {
    throw new Error(`절기 데이터가 없는 년도입니다: ${year}`);
  }

  // 12절기 인덱스와 절기월 매핑 (MONTH_DIVIDING_TERM_INDICES)
  // index: 0(소한)=1월, 2(입춘)=2월, 4(경칩)=3월, ..., 22(대설)=12월

  // 역순으로 체크: 대설 → 입동 → ... → 입춘 → 소한
  for (let i = MONTH_DIVIDING_TERM_INDICES.length - 1; i >= 0; i--) {
    const termIndex = MONTH_DIVIDING_TERM_INDICES[i];
    const termMMDD = data[termIndex];
    if (mmdd >= termMMDD) {
      return i + 1; // 절기월 (1-12)
    }
  }

  // 소한 이전 = 전년도 대설 이후 → 12월(자월)
  // 이 경우는 1월 1일 ~ 소한 전까지
  return 12;
}

/**
 * 특정 날짜가 해당 년도 입춘 전인지 판별한다
 */
export function isBeforeIpchun(date: SolarDate, year: number): boolean {
  const ipchun = getSolarTermDate(year, '입춘');
  const dateMMDD = toMMDD(date);
  const ipchunMMDD = toMMDD(ipchun);
  return dateMMDD < ipchunMMDD;
}
