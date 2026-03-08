/**
 * 세운(歲運) 상세 분석 모듈
 *
 * 특정 연도의 세운을 분석한다.
 * - 세운 간지 계산
 * - 세운 천간/지지 vs 일간 십신 계산
 * - 세운 지지 vs 원국 지지 충/합/형 판별
 * - 해당 연도 대운 매칭
 */

import type { FourPillars, GanJi, EarthlyBranch, HeavenlyStem } from '../types/index.js';
import type { TenGod, MajorFatePeriod } from '../types/analysis.js';
import { getStemByIndex, getBranchByIndex } from '../core/index.js';
import { getTenGod } from './ten-gods.js';
import { checkBranchInteraction, type BranchInteraction } from '../data/branch-interactions.js';

/** 지지 본기(本氣) 천간 매핑 */
const BRANCH_MAIN_STEM: Record<EarthlyBranch, HeavenlyStem> = {
  '자': '계',  // 수
  '축': '기',  // 토
  '인': '갑',  // 목
  '묘': '을',  // 목
  '진': '무',  // 토
  '사': '병',  // 화
  '오': '정',  // 화
  '미': '기',  // 토
  '신': '경',  // 금
  '유': '신',  // 금
  '술': '무',  // 토
  '해': '임',  // 수
};

/** 지지 상호작용 결과 */
export interface BranchInteractionResult {
  /** 원국 위치 */
  position: string;
  /** 상호작용 유형 */
  type: BranchInteraction;
  /** [세운지지, 원국지지] */
  branches: [EarthlyBranch, EarthlyBranch];
}

/** 세운 분석 결과 */
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
 * 연도로 간지를 계산한다 (입춘 무관, 단순 연도 기반)
 *
 * 세운은 특정 연도의 천간지지이므로 입춘 체크 없이 계산.
 */
function calculateYearGanJi(year: number): GanJi {
  const stem = getStemByIndex((year - 4) % 10);
  const branch = getBranchByIndex((year - 4) % 12);
  return { stem, branch };
}

/**
 * 세운(歲運) 분석
 *
 * @param fourPillars - 사주팔자
 * @param majorFate - 대운 배열
 * @param targetYear - 분석 대상 연도
 * @param birthYear - 출생 연도
 */
export function analyzeAnnualFortune(
  fourPillars: FourPillars,
  majorFate: MajorFatePeriod[],
  targetYear: number,
  birthYear: number,
): AnnualFortune {
  // 1. 세운 간지 계산
  const ganJi = calculateYearGanJi(targetYear);

  // 2. 세운 천간 vs 일간 → 십신
  const dayStem = fourPillars.day.stem;
  const tenGod = getTenGod(dayStem, ganJi.stem);

  // 3. 세운 지지 본기 vs 일간 → 십신
  const mainStem = BRANCH_MAIN_STEM[ganJi.branch];
  const branchTenGod = getTenGod(dayStem, mainStem);

  // 4. 세운 지지 vs 원국 4주 지지 → 충/합/형
  const positions: { key: string; branch: EarthlyBranch }[] = [
    { key: '년지', branch: fourPillars.year.branch },
    { key: '월지', branch: fourPillars.month.branch },
    { key: '일지', branch: fourPillars.day.branch },
    { key: '시지', branch: fourPillars.hour.branch },
  ];

  const interactions: BranchInteractionResult[] = [];
  for (const { key, branch } of positions) {
    const types = checkBranchInteraction(ganJi.branch, branch);
    for (const type of types) {
      interactions.push({
        position: key,
        type,
        branches: [ganJi.branch, branch],
      });
    }
  }

  // 5. 현재 나이 계산 후 대운 매칭 (한국 나이: targetYear - birthYear + 1)
  const age = targetYear - birthYear + 1;
  const currentMajorFate = majorFate.find(
    (period) => age >= period.startAge && age < period.endAge,
  );

  return {
    year: targetYear,
    ganJi,
    tenGod,
    branchTenGod,
    interactions,
    currentMajorFate,
  };
}
