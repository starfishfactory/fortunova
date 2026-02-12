import { describe, it, expect } from 'vitest';
import { solarToLunar, lunarToSolar } from '@/engine/calendar/lunar-converter.js';
import type { SolarDate, LunarDate } from '@/engine/types/index.js';

describe('solarToLunar', () => {
  // === 일반 변환 케이스 (10+개) ===
  it('2024-01-01을 음력으로 변환한다 (2023년 음력 11월 20일)', () => {
    const result = solarToLunar({ year: 2024, month: 1, day: 1 });
    expect(result).toEqual({ year: 2023, month: 11, day: 20, isLeapMonth: false });
  });

  it('2024-02-10 (설날)을 음력으로 변환한다 (2024년 음력 1월 1일)', () => {
    const result = solarToLunar({ year: 2024, month: 2, day: 10 });
    expect(result).toEqual({ year: 2024, month: 1, day: 1, isLeapMonth: false });
  });

  it('2023-01-22 (설날)을 음력으로 변환한다 (2023년 음력 1월 1일)', () => {
    const result = solarToLunar({ year: 2023, month: 1, day: 22 });
    expect(result).toEqual({ year: 2023, month: 1, day: 1, isLeapMonth: false });
  });

  it('1990-05-15을 음력으로 변환한다 (1990년 음력 4월 21일)', () => {
    const result = solarToLunar({ year: 1990, month: 5, day: 15 });
    expect(result).toEqual({ year: 1990, month: 4, day: 21, isLeapMonth: false });
  });

  it('2000-06-01을 음력으로 변환한다 (2000년 음력 4월 29일)', () => {
    const result = solarToLunar({ year: 2000, month: 6, day: 1 });
    expect(result).toEqual({ year: 2000, month: 4, day: 29, isLeapMonth: false });
  });

  it('1985-10-01을 음력으로 변환한다 (1985년 음력 8월 17일)', () => {
    const result = solarToLunar({ year: 1985, month: 10, day: 1 });
    expect(result).toEqual({ year: 1985, month: 8, day: 17, isLeapMonth: false });
  });

  it('2010-09-22 (추석)을 음력으로 변환한다 (2010년 음력 8월 15일)', () => {
    const result = solarToLunar({ year: 2010, month: 9, day: 22 });
    expect(result).toEqual({ year: 2010, month: 8, day: 15, isLeapMonth: false });
  });

  it('1975-03-20을 음력으로 변환한다 (1975년 음력 2월 8일)', () => {
    const result = solarToLunar({ year: 1975, month: 3, day: 20 });
    expect(result).toEqual({ year: 1975, month: 2, day: 8, isLeapMonth: false });
  });

  it('2015-07-15을 음력으로 변환한다 (2015년 음력 5월 30일)', () => {
    const result = solarToLunar({ year: 2015, month: 7, day: 15 });
    expect(result).toEqual({ year: 2015, month: 5, day: 30, isLeapMonth: false });
  });

  it('2019-05-07을 음력으로 변환한다 (2019년 음력 4월 3일)', () => {
    const result = solarToLunar({ year: 2019, month: 5, day: 7 });
    expect(result).toEqual({ year: 2019, month: 4, day: 3, isLeapMonth: false });
  });

  it('2022-12-25을 음력으로 변환한다 (2022년 음력 12월 3일)', () => {
    const result = solarToLunar({ year: 2022, month: 12, day: 25 });
    expect(result).toEqual({ year: 2022, month: 12, day: 3, isLeapMonth: false });
  });

  // === 윤달 변환 (5+개) ===
  it('2023-04-01을 음력으로 변환한다 (2023년 윤2월 11일)', () => {
    const result = solarToLunar({ year: 2023, month: 4, day: 1 });
    expect(result).toEqual({ year: 2023, month: 2, day: 11, isLeapMonth: true });
  });

  it('2023-03-22를 음력으로 변환한다 (2023년 윤2월 1일)', () => {
    const result = solarToLunar({ year: 2023, month: 3, day: 22 });
    expect(result).toEqual({ year: 2023, month: 2, day: 1, isLeapMonth: true });
  });

  it('2020-05-23을 음력으로 변환한다 (2020년 윤4월 1일)', () => {
    const result = solarToLunar({ year: 2020, month: 5, day: 23 });
    expect(result).toEqual({ year: 2020, month: 4, day: 1, isLeapMonth: true });
  });

  it('2017-07-22을 음력으로 변환한다 (2017년 윤5월 29일)', () => {
    const result = solarToLunar({ year: 2017, month: 7, day: 22 });
    expect(result).toEqual({ year: 2017, month: 5, day: 29, isLeapMonth: true });
  });

  it('2012-04-21을 음력으로 변환한다 (2012년 윤3월 1일)', () => {
    const result = solarToLunar({ year: 2012, month: 4, day: 21 });
    expect(result).toEqual({ year: 2012, month: 3, day: 1, isLeapMonth: true });
  });

  it('2025-07-25을 음력으로 변환한다 (2025년 윤6월 1일)', () => {
    const result = solarToLunar({ year: 2025, month: 7, day: 25 });
    expect(result).toEqual({ year: 2025, month: 6, day: 1, isLeapMonth: true });
  });

  // === 경계 케이스 (3+개) ===
  it('양력 1월 1일을 변환한다 (전년도 음력)', () => {
    const result = solarToLunar({ year: 2020, month: 1, day: 1 });
    expect(result).toEqual({ year: 2019, month: 12, day: 7, isLeapMonth: false });
  });

  it('양력 12월 31일을 변환한다', () => {
    const result = solarToLunar({ year: 2023, month: 12, day: 31 });
    expect(result).toEqual({ year: 2023, month: 11, day: 19, isLeapMonth: false });
  });

  it('2025-01-29 (설날)을 음력으로 변환한다 (2025년 음력 1월 1일)', () => {
    const result = solarToLunar({ year: 2025, month: 1, day: 29 });
    expect(result).toEqual({ year: 2025, month: 1, day: 1, isLeapMonth: false });
  });

  // === 데이터 경계 (2+개) ===
  it('1950년 데이터 시작 경계를 처리한다', () => {
    const result = solarToLunar({ year: 1950, month: 6, day: 25 });
    expect(result).toEqual({ year: 1950, month: 5, day: 10, isLeapMonth: false });
  });

  it('2050년 데이터 끝 경계를 처리한다', () => {
    const result = solarToLunar({ year: 2050, month: 3, day: 15 });
    expect(result).toEqual({ year: 2050, month: 2, day: 22, isLeapMonth: false });
  });
});

describe('lunarToSolar', () => {
  // === 일반 변환 ===
  it('2024년 음력 1월 1일을 양력으로 변환한다 (2024-02-10)', () => {
    const result = lunarToSolar({ year: 2024, month: 1, day: 1, isLeapMonth: false });
    expect(result).toEqual({ year: 2024, month: 2, day: 10 });
  });

  it('2023년 음력 1월 1일을 양력으로 변환한다 (2023-01-22)', () => {
    const result = lunarToSolar({ year: 2023, month: 1, day: 1, isLeapMonth: false });
    expect(result).toEqual({ year: 2023, month: 1, day: 22 });
  });

  it('1990년 음력 4월 21일을 양력으로 변환한다 (1990-05-15)', () => {
    const result = lunarToSolar({ year: 1990, month: 4, day: 21, isLeapMonth: false });
    expect(result).toEqual({ year: 1990, month: 5, day: 15 });
  });

  it('2010년 음력 8월 15일(추석)을 양력으로 변환한다 (2010-09-22)', () => {
    const result = lunarToSolar({ year: 2010, month: 8, day: 15, isLeapMonth: false });
    expect(result).toEqual({ year: 2010, month: 9, day: 22 });
  });

  it('2025년 음력 1월 1일을 양력으로 변환한다 (2025-01-29)', () => {
    const result = lunarToSolar({ year: 2025, month: 1, day: 1, isLeapMonth: false });
    expect(result).toEqual({ year: 2025, month: 1, day: 29 });
  });

  // === 윤달 변환 ===
  it('2023년 윤2월 1일을 양력으로 변환한다 (2023-03-22)', () => {
    const result = lunarToSolar({ year: 2023, month: 2, day: 1, isLeapMonth: true });
    expect(result).toEqual({ year: 2023, month: 3, day: 22 });
  });

  it('2020년 윤4월 1일을 양력으로 변환한다 (2020-05-23)', () => {
    const result = lunarToSolar({ year: 2020, month: 4, day: 1, isLeapMonth: true });
    expect(result).toEqual({ year: 2020, month: 5, day: 23 });
  });

  it('2025년 윤6월 1일을 양력으로 변환한다 (2025-07-25)', () => {
    const result = lunarToSolar({ year: 2025, month: 6, day: 1, isLeapMonth: true });
    expect(result).toEqual({ year: 2025, month: 7, day: 25 });
  });

  // === 왕복 변환 검증 ===
  it('양력→음력→양력 왕복 변환이 일치한다', () => {
    const solar: SolarDate = { year: 2024, month: 7, day: 15 };
    const lunar = solarToLunar(solar);
    const solarBack = lunarToSolar(lunar);
    expect(solarBack).toEqual(solar);
  });

  it('음력→양력→음력 왕복 변환이 일치한다', () => {
    const lunar: LunarDate = { year: 2023, month: 5, day: 15, isLeapMonth: false };
    const solar = lunarToSolar(lunar);
    const lunarBack = solarToLunar(solar);
    expect(lunarBack).toEqual(lunar);
  });

  it('윤달 왕복 변환이 일치한다', () => {
    const lunar: LunarDate = { year: 2023, month: 2, day: 15, isLeapMonth: true };
    const solar = lunarToSolar(lunar);
    const lunarBack = solarToLunar(solar);
    expect(lunarBack).toEqual(lunar);
  });
});
