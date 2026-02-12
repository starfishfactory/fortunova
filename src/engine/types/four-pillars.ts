import type { GanJi } from './stems-branches.js';

/**
 * 사주팔자(四柱八字) - 네 기둥
 */
export interface FourPillars {
  /** 년주 (입춘 기준 전환) */
  year: GanJi;
  /** 월주 (절기 기준 전환) */
  month: GanJi;
  /** 일주 (만세력 기반) */
  day: GanJi;
  /** 시주 (야자시/조자시 구분) */
  hour: GanJi;
}

/**
 * 생년월일시 입력
 */
export interface BirthInput {
  year: number;
  month: number;
  day: number;
  /** 0-23, null이면 시주 미사용 */
  hour: number | null;
  /** 양력 false, 음력 true */
  isLunar: boolean;
  /** 윤달 여부 (음력일 때만 유효) */
  isLeapMonth: boolean;
  /** 성별 */
  gender: 'M' | 'F';
}
