import { describe, it, expect } from 'vitest';
import { calculateMonthPillar } from '@/engine/saju/month-pillar.js';
import { KNOWN_SAJU_CASES } from '../../fixtures/known-saju-cases.js';

describe('calculateMonthPillar', () => {
  it('1990-05-15 경년 → 신사월을 반환한다', () => {
    const result = calculateMonthPillar({ year: 1990, month: 5, day: 15 }, '경');
    expect(result).toEqual({ stem: '신', branch: '사' });
  });

  it('1985-10-01 을년 → 을유월을 반환한다', () => {
    const result = calculateMonthPillar({ year: 1985, month: 10, day: 1 }, '을');
    expect(result).toEqual({ stem: '을', branch: '유' });
  });

  it('2000-01-01 기년 → 병자월을 반환한다 (소한 전, 전년 대설 이후 → 자월)', () => {
    const result = calculateMonthPillar({ year: 2000, month: 1, day: 1 }, '기');
    expect(result).toEqual({ stem: '병', branch: '자' });
  });

  it('2024-02-03 계년 → 을축월을 반환한다 (입춘 전)', () => {
    const result = calculateMonthPillar({ year: 2024, month: 2, day: 3 }, '계');
    expect(result).toEqual({ stem: '을', branch: '축' });
  });

  it('2024-02-05 갑년 → 병인월을 반환한다 (입춘 후)', () => {
    const result = calculateMonthPillar({ year: 2024, month: 2, day: 5 }, '갑');
    expect(result).toEqual({ stem: '병', branch: '인' });
  });

  it('1950-06-25 경년 → 임오월을 반환한다', () => {
    const result = calculateMonthPillar({ year: 1950, month: 6, day: 25 }, '경');
    expect(result).toEqual({ stem: '임', branch: '오' });
  });

  it('2050-03-15 경년 → 기묘월을 반환한다', () => {
    const result = calculateMonthPillar({ year: 2050, month: 3, day: 15 }, '경');
    expect(result).toEqual({ stem: '기', branch: '묘' });
  });

  it('1995-07-20 을년 → 계미월을 반환한다', () => {
    const result = calculateMonthPillar({ year: 1995, month: 7, day: 20 }, '을');
    expect(result).toEqual({ stem: '계', branch: '미' });
  });

  it('2023-12-31 계년 → 갑자월을 반환한다', () => {
    const result = calculateMonthPillar({ year: 2023, month: 12, day: 31 }, '계');
    expect(result).toEqual({ stem: '갑', branch: '자' });
  });

  describe('stemOffset 그룹별 검증', () => {
    it('갑/기년 그룹: stemOffset=2 (병인월 시작)', () => {
      // 갑년 2월(인월): 병인
      const result = calculateMonthPillar({ year: 2024, month: 2, day: 5 }, '갑');
      expect(result.stem).toBe('병');
    });

    it('을/경년 그룹: stemOffset=4 (무인월 시작)', () => {
      // 경년 절기월5(사월): (4+5-2)%10=7 → 신
      const result = calculateMonthPillar({ year: 1990, month: 5, day: 15 }, '경');
      expect(result.stem).toBe('신');
    });

    it('병/신년 그룹: stemOffset=6 (경인월 시작)', () => {
      // 병년 인월: 경인
      const result = calculateMonthPillar({ year: 2026, month: 2, day: 5 }, '병');
      expect(result.stem).toBe('경');
    });

    it('정/임년 그룹: stemOffset=8 (임인월 시작)', () => {
      // 임년 인월: 임인
      const result = calculateMonthPillar({ year: 2022, month: 2, day: 5 }, '임');
      expect(result.stem).toBe('임');
    });

    it('무/계년 그룹: stemOffset=0 (갑인월 시작)', () => {
      // 계년 인월: 갑인
      const result = calculateMonthPillar({ year: 2023, month: 2, day: 5 }, '계');
      expect(result.stem).toBe('갑');
    });
  });

  it('known-saju-cases의 모든 양력 케이스에서 월주가 일치한다', () => {
    for (const c of KNOWN_SAJU_CASES) {
      if (c.input.isLunar) continue;
      const { year, month, day } = c.input;
      const yearStem = c.expected.year.stem;
      const result = calculateMonthPillar({ year, month, day }, yearStem);
      expect(result, `${c.id}: ${c.description}`).toEqual(c.expected.month);
    }
  });
});
