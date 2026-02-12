import { describe, it, expect } from 'vitest';
import { calculateYearPillar } from '@/engine/saju/year-pillar.js';
import { KNOWN_SAJU_CASES } from '../../fixtures/known-saju-cases.js';

describe('calculateYearPillar', () => {
  it('일반 케이스: 1990-05-15 → 경오년을 반환한다', () => {
    const result = calculateYearPillar({ year: 1990, month: 5, day: 15 });
    expect(result).toEqual({ stem: '경', branch: '오' });
  });

  it('일반 케이스: 1985-10-01 → 을축년을 반환한다', () => {
    const result = calculateYearPillar({ year: 1985, month: 10, day: 1 });
    expect(result).toEqual({ stem: '을', branch: '축' });
  });

  it('입춘 전: 2000-01-01 → 기묘년을 반환한다 (1999년 적용)', () => {
    const result = calculateYearPillar({ year: 2000, month: 1, day: 1 });
    expect(result).toEqual({ stem: '기', branch: '묘' });
  });

  it('입춘 전: 2024-02-03 → 계묘년을 반환한다 (2023년 적용)', () => {
    const result = calculateYearPillar({ year: 2024, month: 2, day: 3 });
    expect(result).toEqual({ stem: '계', branch: '묘' });
  });

  it('입춘 후: 2024-02-05 → 갑진년을 반환한다', () => {
    const result = calculateYearPillar({ year: 2024, month: 2, day: 5 });
    expect(result).toEqual({ stem: '갑', branch: '진' });
  });

  it('데이터 경계 하한: 1950-06-25 → 경인년을 반환한다', () => {
    const result = calculateYearPillar({ year: 1950, month: 6, day: 25 });
    expect(result).toEqual({ stem: '경', branch: '인' });
  });

  it('데이터 경계 상한: 2050-03-15 → 경오년을 반환한다', () => {
    const result = calculateYearPillar({ year: 2050, month: 3, day: 15 });
    expect(result).toEqual({ stem: '경', branch: '오' });
  });

  it('야자시 케이스: 1995-07-20 → 을해년을 반환한다', () => {
    const result = calculateYearPillar({ year: 1995, month: 7, day: 20 });
    expect(result).toEqual({ stem: '을', branch: '해' });
  });

  it('연말 경계: 2023-12-31 → 계묘년을 반환한다', () => {
    const result = calculateYearPillar({ year: 2023, month: 12, day: 31 });
    expect(result).toEqual({ stem: '계', branch: '묘' });
  });

  it('known-saju-cases의 모든 케이스에서 년주가 일치한다', () => {
    for (const c of KNOWN_SAJU_CASES) {
      if (c.input.isLunar) continue; // 양력 케이스만 테스트
      const { year, month, day } = c.input;
      const result = calculateYearPillar({ year, month, day });
      expect(result, `${c.id}: ${c.description}`).toEqual(c.expected.year);
    }
  });
});
