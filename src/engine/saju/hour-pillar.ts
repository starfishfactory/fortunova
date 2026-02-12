import type { GanJi, HeavenlyStem } from '@/engine/types/index.js';
import { getHourBranch, getStemByIndex, getStemIndex, getBranchIndex } from '@/engine/core/index.js';

/**
 * 시주(時柱) 계산
 *
 * @param hour - 시간 (0-23), null이면 시간 미입력
 * @param dayStem - 일간(日干)
 * @returns 시주 간지, hour가 null이면 null
 */
export function calculateHourPillar(hour: number | null, dayStem: HeavenlyStem): GanJi | null {
  if (hour === null) return null;

  const hourBranch = getHourBranch(hour);
  const stemOffset = (getStemIndex(dayStem) % 5) * 2;
  const branchIndex = getBranchIndex(hourBranch);
  const hourStemIndex = (stemOffset + branchIndex) % 10;

  return {
    stem: getStemByIndex(hourStemIndex),
    branch: hourBranch,
  };
}
