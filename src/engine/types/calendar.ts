/**
 * 양력 날짜
 */
export interface SolarDate {
  year: number;
  month: number;
  day: number;
}

/**
 * 음력 날짜
 */
export interface LunarDate {
  year: number;
  month: number;
  day: number;
  isLeapMonth: boolean;
}

/**
 * 24절기 정보
 */
export interface SolarTerm {
  /** 절기 이름 */
  name: string;
  /** 양력 날짜 */
  date: SolarDate;
  /** 정확한 시각 (ISO8601) */
  exactTime?: string;
}

/**
 * 24절기 이름 (절기 12 + 중기 12)
 * 월주 판별에 사용하는 것은 절기(節氣) 12개
 */
export type SolarTermName =
  | '소한' | '대한'
  | '입춘' | '우수'
  | '경칩' | '춘분'
  | '청명' | '곡우'
  | '입하' | '소만'
  | '망종' | '하지'
  | '소서' | '대서'
  | '입추' | '처서'
  | '백로' | '추분'
  | '한로' | '상강'
  | '입동' | '소설'
  | '대설' | '동지';

/**
 * 월주 판별에 사용하는 12절기 (절기만, 중기 제외)
 */
export type MonthDividingSolarTerm =
  | '소한' | '입춘' | '경칩' | '청명' | '입하' | '망종'
  | '소서' | '입추' | '백로' | '한로' | '입동' | '대설';
