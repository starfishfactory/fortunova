import type { GanJi } from '../types/index.js';
import { HEAVENLY_STEMS } from './heavenly-stems.js';
import { EARTHLY_BRANCHES } from './earthly-branches.js';

/** 60갑자 배열 생성: 천간[i%10] + 지지[i%12], i=0..59 */
function buildSixtyCycle(): readonly GanJi[] {
  const cycle: GanJi[] = [];
  for (let i = 0; i < 60; i++) {
    cycle.push({
      stem: HEAVENLY_STEMS[i % 10],
      branch: EARTHLY_BRANCHES[i % 12],
    });
  }
  return Object.freeze(cycle);
}

/** 60갑자 배열 (갑자~계해) */
export const SIXTY_CYCLE: readonly GanJi[] = buildSixtyCycle();

/** 인덱스(0-59) → GanJi (모듈러 연산) */
export function getGanJiByIndex(index: number): GanJi {
  return SIXTY_CYCLE[((index % 60) + 60) % 60];
}

/** GanJi → 인덱스(0-59) */
export function getIndexByGanJi(ganJi: GanJi): number {
  return SIXTY_CYCLE.findIndex(
    (g) => g.stem === ganJi.stem && g.branch === ganJi.branch,
  );
}

/** 다음 간지 */
export function getNextGanJi(ganJi: GanJi): GanJi {
  const idx = getIndexByGanJi(ganJi);
  return getGanJiByIndex(idx + 1);
}

/** 이전 간지 */
export function getPrevGanJi(ganJi: GanJi): GanJi {
  const idx = getIndexByGanJi(ganJi);
  return getGanJiByIndex(idx - 1);
}
