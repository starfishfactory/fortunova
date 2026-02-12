import type { FiveElement, GanJi } from './stems-branches.js';
import type { FourPillars } from './four-pillars.js';

/**
 * 십신(十神) - 일간 기준 관계
 */
export type TenGod =
  | '비견' | '겁재'   // 비겁 (같은 오행)
  | '식신' | '상관'   // 식상 (내가 생하는 오행)
  | '편재' | '정재'   // 재성 (내가 극하는 오행)
  | '편관' | '정관'   // 관성 (나를 극하는 오행)
  | '편인' | '정인';  // 인성 (나를 생하는 오행)

/**
 * 일간 강약
 */
export type DayMasterStrength = 'strong' | 'weak' | 'neutral';

/**
 * 대운(大運) 기간
 */
export interface MajorFatePeriod {
  /** 시작 나이 */
  startAge: number;
  /** 종료 나이 */
  endAge: number;
  /** 대운 간지 */
  ganJi: GanJi;
}

/**
 * 사주 분석 결과
 */
export interface SajuAnalysis {
  /** 사주팔자 */
  fourPillars: FourPillars;
  /** 십신 매핑 */
  tenGods: Record<string, TenGod>;
  /** 오행 비율 */
  elementBalance: Record<FiveElement, number>;
  /** 일간 강약 */
  dayMasterStrength: DayMasterStrength;
  /** 용신 */
  usefulGod: FiveElement;
  /** 대운 */
  majorFate: MajorFatePeriod[];
}
