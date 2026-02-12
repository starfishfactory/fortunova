import type { HeavenlyStem, EarthlyBranch, YinYang } from '../types/index.js';
import { getStemYinYang } from './heavenly-stems.js';
import { getBranchYinYang } from './earthly-branches.js';

const STEMS = new Set<string>(['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계']);

/**
 * 천간 또는 지지가 양인지 판별
 * '신'은 천간/지지에 모두 존재하므로 kind로 구분 가능 (기본: 천간 우선)
 */
export function isYang(
  stemOrBranch: HeavenlyStem | EarthlyBranch,
  kind?: 'stem' | 'branch',
): boolean {
  if (kind === 'branch') {
    return getBranchYinYang(stemOrBranch as EarthlyBranch) === '양';
  }
  if (kind === 'stem' || STEMS.has(stemOrBranch)) {
    return getStemYinYang(stemOrBranch as HeavenlyStem) === '양';
  }
  return getBranchYinYang(stemOrBranch as EarthlyBranch) === '양';
}

/**
 * 천간 또는 지지가 음인지 판별
 * '신'은 천간/지지에 모두 존재하므로 kind로 구분 가능 (기본: 천간 우선)
 */
export function isYin(
  stemOrBranch: HeavenlyStem | EarthlyBranch,
  kind?: 'stem' | 'branch',
): boolean {
  return !isYang(stemOrBranch, kind);
}

/** 반대 음양 반환 */
export function getOpposite(yinYang: YinYang): YinYang {
  return yinYang === '양' ? '음' : '양';
}
