/**
 * 지지 상호작용 데이터 (충/합/형)
 */

import type { EarthlyBranch } from '../types/index.js';

/** 지지 상호작용 타입 */
export type BranchInteraction = '충' | '합' | '형';

/** 육충(六衝) 매핑: 서로 충돌하는 지지 */
const CHUNG_MAP: Record<EarthlyBranch, EarthlyBranch> = {
  '자': '오', '오': '자',
  '축': '미', '미': '축',
  '인': '신', '신': '인',
  '묘': '유', '유': '묘',
  '진': '술', '술': '진',
  '사': '해', '해': '사',
};

/** 육합(六合) 매핑: 서로 합하는 지지 */
const HAP_MAP: Record<EarthlyBranch, EarthlyBranch> = {
  '자': '축', '축': '자',
  '인': '해', '해': '인',
  '묘': '술', '술': '묘',
  '진': '유', '유': '진',
  '사': '신', '신': '사',
  '오': '미', '미': '오',
};

/** 삼형(三刑) 매핑: 형살 관계 */
const HYUNG_MAP: Record<EarthlyBranch, EarthlyBranch[]> = {
  '인': ['사'],         // 무은지형
  '사': ['인', '신'],   // 무은지형
  '신': ['사'],         // 무은지형 (인↔신은 충이므로 형은 사만)
  '축': ['술', '미'],   // 무례지형
  '술': ['축', '미'],   // 무례지형
  '미': ['축', '술'],   // 무례지형
  '자': ['묘'],         // 무례지형
  '묘': ['자'],         // 무례지형
  '진': ['진'],         // 자형
  '오': ['오'],         // 자형
  '유': ['유'],         // 자형
  '해': ['해'],         // 자형
};

/** 충 상대 반환 */
export function getChung(branch: EarthlyBranch): EarthlyBranch {
  return CHUNG_MAP[branch];
}

/** 합 상대 반환 */
export function getHap(branch: EarthlyBranch): EarthlyBranch {
  return HAP_MAP[branch];
}

/** 형 상대들 반환 (복수) */
export function getHyung(branch: EarthlyBranch): EarthlyBranch[] {
  return HYUNG_MAP[branch];
}

/** 두 지지 간 상호작용 판별 */
export function checkBranchInteraction(a: EarthlyBranch, b: EarthlyBranch): BranchInteraction[] {
  const result: BranchInteraction[] = [];

  if (CHUNG_MAP[a] === b) {
    result.push('충');
  }

  if (HAP_MAP[a] === b) {
    result.push('합');
  }

  if (HYUNG_MAP[a]?.includes(b)) {
    result.push('형');
  }

  return result;
}
