/**
 * 진태양시(True Solar Time) 보정 모듈
 *
 * 사주 시주 판별을 위해 관측 지점의 진태양시를 계산한다.
 * 표준시(KST)와 실제 태양 시간의 차이를 보정한다.
 */

import type { SolarDate } from '@/engine/types/index.js';

/** 한국 표준시 기준 경도 (일본 표준시 = UTC+9) */
const STANDARD_LONGITUDE = 135.0;

/**
 * 균시차(Equation of Time) 계산
 *
 * 태양의 겉보기 운동과 평균 태양 사이의 시간 차이
 * @returns 분 단위의 균시차 (양수: 진태양시가 평균태양시보다 빠름)
 */
function equationOfTime(date: SolarDate): number {
  // 연중 일수(day of year) 계산
  const daysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const isLeap = (date.year % 4 === 0 && date.year % 100 !== 0) || date.year % 400 === 0;
  if (isLeap) daysInMonth[2] = 29;

  let dayOfYear = date.day;
  for (let m = 1; m < date.month; m++) {
    dayOfYear += daysInMonth[m];
  }

  // 태양의 평균 이상각 (Spencer, 1971 공식)
  const B = (2 * Math.PI * (dayOfYear - 81)) / 365;

  // 균시차 (분)
  // Spencer (1971) 근사 공식
  const eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);

  return eot;
}

/**
 * 진태양시를 계산한다
 *
 * @param date - 양력 날짜
 * @param hour - 시 (0-23)
 * @param minute - 분 (0-59)
 * @param longitude - 관측 지점 경도 (도)
 * @returns 보정된 시각 { hour, minute }
 */
export function calculateTrueSolarTime(
  date: SolarDate,
  hour: number,
  minute: number,
  longitude: number,
): { hour: number; minute: number } {
  // 경도 보정: (관측 경도 - 표준 경도) × 4분/도
  const longitudeCorrection = (longitude - STANDARD_LONGITUDE) * 4;

  // 균시차
  const eot = equationOfTime(date);

  // 총 보정 (분)
  const totalCorrection = longitudeCorrection + eot;

  // 보정 적용
  let totalMinutes = hour * 60 + minute + totalCorrection;

  // 24시간 범위로 정규화
  totalMinutes = ((totalMinutes % 1440) + 1440) % 1440;

  return {
    hour: Math.floor(totalMinutes / 60),
    minute: Math.round(totalMinutes % 60),
  };
}

/**
 * 시주 판별용 시간을 진태양시로 보정한다
 *
 * @param hour - 표준시 기준 시 (0-23)
 * @param date - 양력 날짜
 * @param longitude - 관측 지점 경도
 * @returns 보정된 시 (0-23)
 */
export function adjustHourForTrueSolarTime(
  hour: number,
  date: SolarDate,
  longitude: number,
): number {
  const result = calculateTrueSolarTime(date, hour, 0, longitude);
  return result.hour;
}
