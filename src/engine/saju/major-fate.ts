import type { FourPillars } from '../types/index.js';
import type { MajorFatePeriod } from '../types/analysis.js';
import { getStemYinYang } from '../core/heavenly-stems.js';
import { getNextGanJi, getPrevGanJi } from '../core/sixty-cycle.js';

/**
 * 대운(大運)을 계산한다.
 *
 * 월주를 기반으로 10년 주기, 8개 대운(80년) 반환.
 *
 * 순행/역행 규칙:
 * - 남자 양년생 / 여자 음년생: 순행 (월주 다음 간지부터)
 * - 남자 음년생 / 여자 양년생: 역행 (월주 이전 간지부터)
 *
 * 대운 시작 나이는 간략화하여 1세부터 시작 (Phase 2 단순화).
 */
export function calculateMajorFate(
  fourPillars: FourPillars,
  gender: 'M' | 'F',
  birthYear: number,
): MajorFatePeriod[] {
  const yearStemYinYang = getStemYinYang(fourPillars.year.stem);
  const isYangYear = yearStemYinYang === '양';

  // 순행: 남자양년 or 여자음년 / 역행: 남자음년 or 여자양년
  const isForward =
    (gender === 'M' && isYangYear) || (gender === 'F' && !isYangYear);

  const monthGanJi = fourPillars.month;
  const periods: MajorFatePeriod[] = [];

  let currentGanJi = isForward
    ? getNextGanJi(monthGanJi)
    : getPrevGanJi(monthGanJi);

  // Phase 2 단순화: 첫 대운 시작 나이를 1세로 고정
  const startAge = 1;

  for (let i = 0; i < 8; i++) {
    periods.push({
      startAge: startAge + i * 10,
      endAge: startAge + (i + 1) * 10,
      ganJi: { ...currentGanJi },
    });

    currentGanJi = isForward
      ? getNextGanJi(currentGanJi)
      : getPrevGanJi(currentGanJi);
  }

  return periods;
}
