import { describe, it, expect } from 'vitest';
import { calculateFourPillars } from '@/engine/saju/four-pillars.js';
import { KNOWN_SAJU_CASES } from '../../fixtures/known-saju-cases.js';

describe('calculateFourPillars', () => {
  it('양력 입력을 처리한다', () => {
    const result = calculateFourPillars({
      year: 1990, month: 5, day: 15, hour: 14,
      isLunar: false, isLeapMonth: false, gender: 'M',
    });
    expect(result.year).toEqual({ stem: '경', branch: '오' });
    expect(result.month).toEqual({ stem: '신', branch: '사' });
    expect(result.day).toBeTruthy();
    expect(result.hour).toBeTruthy();
  });

  it('음력 입력을 양력으로 변환 후 처리한다', () => {
    const result = calculateFourPillars({
      year: 2023, month: 2, day: 15, hour: 12,
      isLunar: true, isLeapMonth: true, gender: 'F',
    });
    expect(result.year).toEqual({ stem: '계', branch: '묘' });
    expect(result.month).toEqual({ stem: '병', branch: '진' });
  });

  it('시간이 null이면 자시(0시) 기본 처리한다', () => {
    const result = calculateFourPillars({
      year: 2000, month: 1, day: 1, hour: null,
      isLunar: false, isLeapMonth: false, gender: 'M',
    });
    expect(result.hour).toBeTruthy();
    expect(result.hour.branch).toBe('자');
  });

  describe('known-saju-cases 교차 검증', () => {
    for (const testCase of KNOWN_SAJU_CASES) {
      it(`${testCase.id}: ${testCase.description}`, () => {
        const result = calculateFourPillars(testCase.input);
        expect(result.year, '년주').toEqual(testCase.expected.year);
        expect(result.month, '월주').toEqual(testCase.expected.month);
        expect(result.day, '일주').toEqual(testCase.expected.day);
        expect(result.hour, '시주').toEqual(testCase.expected.hour);
      });
    }
  });
});
