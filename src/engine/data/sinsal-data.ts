import type { EarthlyBranch, HeavenlyStem } from '../types/index.js';

/**
 * 삼합국 그룹 - 도화살, 역마살, 화개살 판별용
 * 일지가 속한 삼합국에 따라 해당 신살 지지를 결정
 */
type SamhapGroup = readonly EarthlyBranch[];

/** 삼합국 4그룹 */
const SAMHAP_GROUPS: readonly SamhapGroup[] = [
  ['인', '오', '술'],  // 인오술
  ['사', '유', '축'],  // 사유축
  ['신', '자', '진'],  // 신자진
  ['해', '묘', '미'],  // 해묘미
] as const;

/**
 * 도화살(桃花殺) 매핑 - 삼합국 인덱스 → 도화 지지
 * 인오술 → 묘, 사유축 → 오, 신자진 → 유, 해묘미 → 자
 */
const DOHWA_MAP: readonly EarthlyBranch[] = ['묘', '오', '유', '자'] as const;

/**
 * 역마살(驛馬殺) 매핑 - 삼합국 인덱스 → 역마 지지
 * 인오술 → 신, 사유축 → 해, 신자진 → 인, 해묘미 → 사
 */
const YEOKMA_MAP: readonly EarthlyBranch[] = ['신', '해', '인', '사'] as const;

/**
 * 화개살(華蓋殺) 매핑 - 삼합국 인덱스 → 화개 지지
 * 인오술 → 술, 사유축 → 축, 신자진 → 진, 해묘미 → 미
 */
const HWAGAE_MAP: readonly EarthlyBranch[] = ['술', '축', '진', '미'] as const;

/**
 * 천을귀인(天乙貴人) 매핑 - 일간 → 귀인 지지 2개
 */
const CHEONUL_MAP: Record<HeavenlyStem, readonly EarthlyBranch[]> = {
  '갑': ['축', '미'],
  '무': ['축', '미'],
  '을': ['자', '신'],
  '기': ['자', '신'],
  '병': ['해', '유'],
  '정': ['해', '유'],
  '경': ['인', '오'],
  '신': ['인', '오'],
  '임': ['묘', '사'],
  '계': ['묘', '사'],
} as const;

/**
 * 양인살(羊刃殺) 매핑 - 일간 → 양인 지지 (양간만 해당)
 * 음간(을, 정, 기, 신, 계)은 null
 */
const YANGIN_MAP: Record<HeavenlyStem, EarthlyBranch | null> = {
  '갑': '묘',
  '병': '오',
  '무': '오',
  '경': '유',
  '임': '자',
  '을': null,
  '정': null,
  '기': null,
  '신': null,
  '계': null,
} as const;

/**
 * 공망(空亡) 매핑 - 순(旬) 인덱스(0-5) → 공망 지지 2개
 * 60갑자를 10개씩 나누면 6순
 * 순 인덱스 = Math.floor(일주의 60갑자 인덱스 / 10)
 */
const GONGMANG_MAP: readonly (readonly [EarthlyBranch, EarthlyBranch])[] = [
  ['술', '해'],  // 갑자순 (0-9)
  ['신', '유'],  // 갑술순 (10-19)
  ['오', '미'],  // 갑신순 (20-29)
  ['진', '사'],  // 갑오순 (30-39)
  ['인', '묘'],  // 갑진순 (40-49)
  ['자', '축'],  // 갑인순 (50-59)
] as const;

/**
 * 일지가 속한 삼합국 인덱스를 반환 (0-3)
 */
export function getSamhapGroupIndex(dayBranch: EarthlyBranch): number {
  for (let i = 0; i < SAMHAP_GROUPS.length; i++) {
    if (SAMHAP_GROUPS[i].includes(dayBranch)) {
      return i;
    }
  }
  // 모든 지지는 반드시 하나의 삼합국에 속함
  return -1;
}

/** 도화살 지지를 반환 (일지 기준) */
export function getDohwaBranch(dayBranch: EarthlyBranch): EarthlyBranch {
  return DOHWA_MAP[getSamhapGroupIndex(dayBranch)];
}

/** 역마살 지지를 반환 (일지 기준) */
export function getYeokmaBranch(dayBranch: EarthlyBranch): EarthlyBranch {
  return YEOKMA_MAP[getSamhapGroupIndex(dayBranch)];
}

/** 화개살 지지를 반환 (일지 기준) */
export function getHwagaeBranch(dayBranch: EarthlyBranch): EarthlyBranch {
  return HWAGAE_MAP[getSamhapGroupIndex(dayBranch)];
}

/** 천을귀인 지지 배열을 반환 (일간 기준) */
export function getCheonulBranches(dayStem: HeavenlyStem): readonly EarthlyBranch[] {
  return CHEONUL_MAP[dayStem];
}

/** 양인살 지지를 반환 (일간 기준), 없으면 null */
export function getYanginBranch(dayStem: HeavenlyStem): EarthlyBranch | null {
  return YANGIN_MAP[dayStem];
}

/** 공망 지지 배열을 반환 (일주의 60갑자 인덱스 기준) */
export function getGongmangBranches(sixtyCycleIndex: number): readonly [EarthlyBranch, EarthlyBranch] {
  const sunIndex = Math.floor(sixtyCycleIndex / 10);
  return GONGMANG_MAP[sunIndex];
}
