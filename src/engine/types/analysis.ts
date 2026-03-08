import type { FiveElement, GanJi, EarthlyBranch } from './stems-branches.js';
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
 * 지지 상호작용 타입
 */
export type BranchInteraction = '충' | '합' | '형';

/**
 * 지지 상호작용 결과
 */
export interface BranchInteractionResult {
  /** 원국 위치 */
  position: string;
  /** 상호작용 유형 */
  type: BranchInteraction;
  /** [세운지지, 원국지지] */
  branches: [EarthlyBranch, EarthlyBranch];
}

/**
 * 세운(歲運) 분석 결과
 */
export interface AnnualFortune {
  /** 대상 연도 */
  year: number;
  /** 해당 연도 간지 */
  ganJi: GanJi;
  /** 세운 천간 vs 일간 십신 */
  tenGod: TenGod;
  /** 세운 지지 본기 vs 일간 십신 */
  branchTenGod: TenGod;
  /** 세운 지지 vs 원국 지지 상호작용 */
  interactions: BranchInteractionResult[];
  /** 해당 연도의 대운 */
  currentMajorFate?: MajorFatePeriod;
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
  /** 세운 */
  annualFortune?: AnnualFortune;
}
