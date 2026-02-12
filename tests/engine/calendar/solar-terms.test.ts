import { describe, it, expect } from 'vitest';
import { getSolarTermDate, getMonthSolarTerm, isBeforeIpchun } from '@/engine/calendar/solar-terms.js';

describe('getSolarTermDate', () => {
  it('2024년 입춘 날짜를 반환한다', () => {
    const result = getSolarTermDate(2024, '입춘');
    expect(result).toEqual({ year: 2024, month: 2, day: 4 });
  });

  it('2025년 입춘 날짜를 반환한다', () => {
    const result = getSolarTermDate(2025, '입춘');
    expect(result).toEqual({ year: 2025, month: 2, day: 3 });
  });

  it('2024년 소한 날짜를 반환한다', () => {
    const result = getSolarTermDate(2024, '소한');
    expect(result).toEqual({ year: 2024, month: 1, day: 6 });
  });

  it('2024년 동지 날짜를 반환한다', () => {
    const result = getSolarTermDate(2024, '동지');
    expect(result).toEqual({ year: 2024, month: 12, day: 21 });
  });

  it('2024년 경칩 날짜를 반환한다', () => {
    const result = getSolarTermDate(2024, '경칩');
    expect(result).toEqual({ year: 2024, month: 3, day: 5 });
  });

  it('2024년 하지 날짜를 반환한다', () => {
    const result = getSolarTermDate(2024, '하지');
    expect(result).toEqual({ year: 2024, month: 6, day: 21 });
  });

  it('범위 밖 년도에서 에러를 던진다', () => {
    expect(() => getSolarTermDate(1940, '입춘')).toThrow();
  });
});

describe('getMonthSolarTerm', () => {
  // 절기월은 12절기 기준:
  // 소한~입춘 전: 1월(축월)
  // 입춘~경칩 전: 2월(인월)
  // 경칩~청명 전: 3월(묘월)
  // ...
  // 대설~소한 전: 12월(자월)

  it('2024-01-10은 절기 1월(축월)이다 (소한 후, 입춘 전)', () => {
    expect(getMonthSolarTerm({ year: 2024, month: 1, day: 10 })).toBe(1);
  });

  it('2024-02-03은 절기 1월(축월)이다 (입춘 전날)', () => {
    expect(getMonthSolarTerm({ year: 2024, month: 2, day: 3 })).toBe(1);
  });

  it('2024-02-04은 절기 2월(인월)이다 (입춘 당일)', () => {
    expect(getMonthSolarTerm({ year: 2024, month: 2, day: 4 })).toBe(2);
  });

  it('2024-03-04은 절기 2월(인월)이다 (경칩 전날)', () => {
    expect(getMonthSolarTerm({ year: 2024, month: 3, day: 4 })).toBe(2);
  });

  it('2024-03-05은 절기 3월(묘월)이다 (경칩 당일)', () => {
    expect(getMonthSolarTerm({ year: 2024, month: 3, day: 5 })).toBe(3);
  });

  it('2024-06-20은 절기 6월(오월)이다 (망종 후, 소서 전)', () => {
    expect(getMonthSolarTerm({ year: 2024, month: 6, day: 20 })).toBe(6);
  });

  it('2024-06-21은 절기 6월(오월)이다 (하지는 중기이므로 영향 없음)', () => {
    expect(getMonthSolarTerm({ year: 2024, month: 6, day: 21 })).toBe(6);
  });

  it('2024-07-06은 절기 7월(미월)이다 (소서 당일)', () => {
    expect(getMonthSolarTerm({ year: 2024, month: 7, day: 6 })).toBe(7);
  });

  it('2024-12-06은 절기 11월(해월)이다 (입동 후, 대설 전)', () => {
    expect(getMonthSolarTerm({ year: 2024, month: 12, day: 6 })).toBe(11);
  });

  it('2024-12-07은 절기 12월(자월)이다 (대설 당일)', () => {
    expect(getMonthSolarTerm({ year: 2024, month: 12, day: 7 })).toBe(12);
  });

  it('2024-12-31은 절기 12월(자월)이다 (대설 후, 다음해 소한 전)', () => {
    expect(getMonthSolarTerm({ year: 2024, month: 12, day: 31 })).toBe(12);
  });

  it('2025-01-04은 절기 12월(자월)이다 (2025 소한 전)', () => {
    expect(getMonthSolarTerm({ year: 2025, month: 1, day: 4 })).toBe(12);
  });

  it('2025-01-05은 절기 1월(축월)이다 (2025 소한 당일)', () => {
    expect(getMonthSolarTerm({ year: 2025, month: 1, day: 5 })).toBe(1);
  });
});

describe('isBeforeIpchun', () => {
  it('2024-02-03은 입춘 전이다', () => {
    expect(isBeforeIpchun({ year: 2024, month: 2, day: 3 }, 2024)).toBe(true);
  });

  it('2024-02-04은 입춘 전이 아니다 (당일)', () => {
    expect(isBeforeIpchun({ year: 2024, month: 2, day: 4 }, 2024)).toBe(false);
  });

  it('2024-02-05은 입춘 후이다', () => {
    expect(isBeforeIpchun({ year: 2024, month: 2, day: 5 }, 2024)).toBe(false);
  });

  it('2024-01-01은 입춘 전이다', () => {
    expect(isBeforeIpchun({ year: 2024, month: 1, day: 1 }, 2024)).toBe(true);
  });

  it('2025-02-02은 2025년 입춘(2/3) 전이다', () => {
    expect(isBeforeIpchun({ year: 2025, month: 2, day: 2 }, 2025)).toBe(true);
  });

  it('2025-02-03은 2025년 입춘 당일이므로 입춘 전이 아니다', () => {
    expect(isBeforeIpchun({ year: 2025, month: 2, day: 3 }, 2025)).toBe(false);
  });
});
