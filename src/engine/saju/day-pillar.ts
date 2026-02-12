/**
 * 일주(日柱) 계산 모듈
 *
 * 율리우스 적일(Julian Day Number)과 간지 사이클의 알려진 오프셋으로
 * 60갑자 인덱스를 결정한다.
 *
 * 공식: dayGanJiIndex = (JD + 49) % 60
 * 검증: JD 2451545 (2000-01-01) → 무오(54)
 */

import type { SolarDate, GanJi } from '@/engine/types/index.js';
import { getGanJiByIndex } from '@/engine/core/index.js';

/**
 * 양력 날짜를 율리우스 적일(Julian Day Number)로 변환한다
 */
function solarToJulianDay(date: SolarDate): number {
  const { year: y, month: m, day: d } = date;
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return (
    d +
    Math.floor((153 * mm + 2) / 5) +
    365 * yy +
    Math.floor(yy / 4) -
    Math.floor(yy / 100) +
    Math.floor(yy / 400) -
    32045
  );
}

/** 간지 사이클 오프셋: (JD + 49) % 60 = 60갑자 인덱스 */
const GANJI_OFFSET = 49;

/**
 * 양력 날짜로 일주를 계산한다
 */
export function calculateDayPillar(solarDate: SolarDate): GanJi {
  const jd = solarToJulianDay(solarDate);
  const ganJiIndex = (jd + GANJI_OFFSET) % 60;
  return getGanJiByIndex(ganJiIndex);
}
