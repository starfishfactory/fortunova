import { describe, it, expect } from 'vitest';
import { LUNAR_YEAR_DATA, getLunarMonthDays, getLunarYearDays } from '@/engine/data/lunar-data.js';

describe('LUNAR_YEAR_DATA', () => {
  it('1950년부터 2050년까지 데이터를 포함한다', () => {
    for (let year = 1950; year <= 2050; year++) {
      expect(LUNAR_YEAR_DATA[year]).toBeDefined();
    }
  });

  it('1948년 이전 데이터는 포함하지 않는다', () => {
    expect(LUNAR_YEAR_DATA[1948]).toBeUndefined();
  });

  it('2051년 이후 데이터는 포함하지 않는다', () => {
    expect(LUNAR_YEAR_DATA[2051]).toBeUndefined();
  });

  it('각 년도의 총 일수가 353-385 범위 내에 있다', () => {
    for (let year = 1950; year <= 2050; year++) {
      const totalDays = getLunarYearDays(year);
      expect(totalDays).toBeGreaterThanOrEqual(353);
      expect(totalDays).toBeLessThanOrEqual(385);
    }
  });

  it('2023년에 윤2월이 있다', () => {
    const info = LUNAR_YEAR_DATA[2023];
    expect(info.leapMonth).toBe(2);
  });

  it('2025년에 윤6월이 있다', () => {
    const info = LUNAR_YEAR_DATA[2025];
    expect(info.leapMonth).toBe(6);
  });

  it('2020년에 윤4월이 있다', () => {
    const info = LUNAR_YEAR_DATA[2020];
    expect(info.leapMonth).toBe(4);
  });

  it('2028년에 윤5월이 있다', () => {
    const info = LUNAR_YEAR_DATA[2028];
    expect(info.leapMonth).toBe(5);
  });

  it('2033년에 윤11월이 있다', () => {
    const info = LUNAR_YEAR_DATA[2033];
    expect(info.leapMonth).toBe(11);
  });

  it('2024년에는 윤달이 없다', () => {
    const info = LUNAR_YEAR_DATA[2024];
    expect(info.leapMonth).toBe(0);
  });

  it('윤달이 없는 해의 leapDays는 0이다', () => {
    for (let year = 1950; year <= 2050; year++) {
      const info = LUNAR_YEAR_DATA[year];
      if (info.leapMonth === 0) {
        expect(info.leapDays).toBe(0);
      }
    }
  });

  it('각 월의 일수는 29일 또는 30일이다', () => {
    for (let year = 1950; year <= 2050; year++) {
      for (let month = 1; month <= 12; month++) {
        const days = getLunarMonthDays(year, month);
        expect(days === 29 || days === 30).toBe(true);
      }
    }
  });

  it('1952년에 윤5월이 있다 (1950년대 검증)', () => {
    const info = LUNAR_YEAR_DATA[1952];
    expect(info.leapMonth).toBe(5);
  });

  it('1987년에 윤6월이 있다 (1980년대 검증)', () => {
    const info = LUNAR_YEAR_DATA[1987];
    expect(info.leapMonth).toBe(6);
  });
});
