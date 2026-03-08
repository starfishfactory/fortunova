import type { FourPillars, SolarDate } from '../types/index.js';
import type { MajorFatePeriod } from '../types/analysis.js';
import { getStemYinYang } from '../core/heavenly-stems.js';
import { getNextGanJi, getPrevGanJi } from '../core/sixty-cycle.js';
import { getNextJieQi, getPrevJieQi, daysBetween } from '../calendar/solar-terms.js';

/**
 * 대운(大運)을 계산한다.
 *
 * 월주를 기반으로 10년 주기, 8개 대운(80년) 반환.
 *
 * 순행/역행 규칙:
 * - 남자 양년생 / 여자 음년생: 순행 (월주 다음 간지부터)
 * - 남자 음년생 / 여자 양년생: 역행 (월주 이전 간지부터)
 *
 * 대운 시작 나이 계산:
 * - 순행: 생일 → 다음 절기까지 일수 / 3 (반올림)
 * - 역행: 이전 절기 → 생일까지 일수 / 3 (반올림)
 * - 최소 1세
 */
export function calculateMajorFate(
  fourPillars: FourPillars,
  gender: 'M' | 'F',
  birthDate: SolarDate,
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

  // 대운 시작 나이 계산
  let days: number;
  if (isForward) {
    // 순행: 생일 → 다음 절기까지 일수
    const nextTerm = getNextJieQi(birthDate);
    days = daysBetween(birthDate, nextTerm.date);
  } else {
    // 역행: 이전 절기 → 생일까지 일수
    const prevTerm = getPrevJieQi(birthDate);
    days = daysBetween(prevTerm.date, birthDate);
  }

  const startAge = Math.max(1, Math.round(days / 3));

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
