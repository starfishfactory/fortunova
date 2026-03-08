import type { FourPillars, EarthlyBranch, SinsalResult, SinsalName } from '../types/index.js';
import { getIndexByGanJi } from '../core/sixty-cycle.js';
import {
  getDohwaBranch,
  getYeokmaBranch,
  getHwagaeBranch,
  getCheonulBranches,
  getYanginBranch,
  getGongmangBranches,
} from '../data/sinsal-data.js';

/** 신살별 의미 설명 */
const SINSAL_DESCRIPTIONS: Record<SinsalName, string> = {
  '도화살': '매력과 인연의 기운',
  '역마살': '이동과 변화의 기운',
  '천을귀인': '귀인의 도움을 받는 기운',
  '화개살': '학문과 예술의 기운',
  '양인살': '강인한 의지와 결단의 기운',
  '공망': '비어 있어 실속이 부족한 기운',
};

/** 주(柱) 위치와 지지 쌍 */
interface PillarPosition {
  label: string;
  branch: EarthlyBranch;
}

/**
 * 일지를 제외한 나머지 3주의 지지 정보를 반환
 */
function getOtherBranches(fourPillars: FourPillars): PillarPosition[] {
  return [
    { label: '년지', branch: fourPillars.year.branch },
    { label: '월지', branch: fourPillars.month.branch },
    { label: '시지', branch: fourPillars.hour.branch },
  ];
}

/**
 * 4주 전체의 지지 정보를 반환
 */
function getAllBranches(fourPillars: FourPillars): PillarPosition[] {
  return [
    { label: '년지', branch: fourPillars.year.branch },
    { label: '월지', branch: fourPillars.month.branch },
    { label: '일지', branch: fourPillars.day.branch },
    { label: '시지', branch: fourPillars.hour.branch },
  ];
}

/**
 * 특정 지지를 가진 위치들에서 신살 결과를 생성
 */
function findInPositions(
  positions: PillarPosition[],
  targetBranches: readonly EarthlyBranch[],
  name: SinsalName,
): SinsalResult[] {
  const results: SinsalResult[] = [];
  for (const pos of positions) {
    if (targetBranches.includes(pos.branch)) {
      results.push({
        name,
        position: pos.label,
        description: SINSAL_DESCRIPTIONS[name],
      });
    }
  }
  return results;
}

/**
 * 사주팔자의 신살(神煞) 6종을 분석한다.
 *
 * 분석 대상: 도화살, 역마살, 천을귀인, 화개살, 양인살, 공망
 */
export function analyzeSinsal(fourPillars: FourPillars): SinsalResult[] {
  const results: SinsalResult[] = [];
  const dayBranch = fourPillars.day.branch;
  const dayStem = fourPillars.day.stem;
  const otherBranches = getOtherBranches(fourPillars);
  const allBranches = getAllBranches(fourPillars);

  // 1. 도화살 - 일지 기준, 나머지 3주에서 검색
  const dohwa = getDohwaBranch(dayBranch);
  results.push(...findInPositions(otherBranches, [dohwa], '도화살'));

  // 2. 역마살 - 일지 기준, 나머지 3주에서 검색
  const yeokma = getYeokmaBranch(dayBranch);
  results.push(...findInPositions(otherBranches, [yeokma], '역마살'));

  // 3. 천을귀인 - 일간 기준, 4주 전체 지지에서 검색
  const cheonul = getCheonulBranches(dayStem);
  results.push(...findInPositions(allBranches, cheonul, '천을귀인'));

  // 4. 화개살 - 일지 기준, 나머지 3주에서 검색
  const hwagae = getHwagaeBranch(dayBranch);
  results.push(...findInPositions(otherBranches, [hwagae], '화개살'));

  // 5. 양인살 - 일간 기준, 4주 전체 지지에서 검색
  const yangin = getYanginBranch(dayStem);
  if (yangin !== null) {
    results.push(...findInPositions(allBranches, [yangin], '양인살'));
  }

  // 6. 공망 - 일주의 60갑자 기준, 나머지 3주에서 검색
  const dayIndex = getIndexByGanJi(fourPillars.day);
  if (dayIndex >= 0) {
    const gongmang = getGongmangBranches(dayIndex);
    results.push(...findInPositions(otherBranches, gongmang, '공망'));
  }

  return results;
}
