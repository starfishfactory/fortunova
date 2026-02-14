import { describe, it, expect } from 'vitest';
import { calculateYearlyFate, calculateYearlyFateRange } from '@/engine/saju/yearly-fate.js';

describe('calculateYearlyFate', () => {
  it('2024년의 세운을 계산한다', () => {
    // 2024 - 4 = 2020, 2020 % 10 = 0 → 갑, 2020 % 12 = 4 → 진
    const result = calculateYearlyFate(2024);
    expect(result.stem).toBe('갑');
    expect(result.branch).toBe('진');
  });

  it('2025년의 세운을 계산한다', () => {
    // 2025 - 4 = 2021, 2021 % 10 = 1 → 을, 2021 % 12 = 5 → 사
    const result = calculateYearlyFate(2025);
    expect(result.stem).toBe('을');
    expect(result.branch).toBe('사');
  });

  it('2026년의 세운을 계산한다', () => {
    // 2026 - 4 = 2022, 2022 % 10 = 2 → 병, 2022 % 12 = 6 → 오
    const result = calculateYearlyFate(2026);
    expect(result.stem).toBe('병');
    expect(result.branch).toBe('오');
  });

  it('2000년(경진년)을 계산한다', () => {
    // 2000 - 4 = 1996, 1996 % 10 = 6 → 경, 1996 % 12 = 4 → 진
    const result = calculateYearlyFate(2000);
    expect(result.stem).toBe('경');
    expect(result.branch).toBe('진');
  });

  it('1990년(경오년)을 계산한다', () => {
    const result = calculateYearlyFate(1990);
    expect(result.stem).toBe('경');
    expect(result.branch).toBe('오');
  });
});

describe('calculateYearlyFateRange', () => {
  it('지정된 범위의 세운을 계산한다', () => {
    const results = calculateYearlyFateRange(2024, 2026);

    expect(results).toHaveLength(3);
    expect(results[0].year).toBe(2024);
    expect(results[0].ganJi.stem).toBe('갑');
    expect(results[2].year).toBe(2026);
    expect(results[2].ganJi.stem).toBe('병');
  });

  it('동일 연도 범위도 동작한다', () => {
    const results = calculateYearlyFateRange(2026, 2026);

    expect(results).toHaveLength(1);
    expect(results[0].year).toBe(2026);
  });

  it('10년 범위를 계산한다', () => {
    const results = calculateYearlyFateRange(2020, 2029);

    expect(results).toHaveLength(10);
    // 천간은 10년 주기
    expect(results[0].ganJi.stem).toBe(results[0].ganJi.stem);
  });
});
