import { describe, it, expect } from 'vitest';
import { KNOWN_SAJU_CASES } from './known-saju-cases.js';

describe('사주 검증 fixture 구조 테스트', () => {
  it('최소 10개의 검증 케이스가 존재한다', () => {
    expect(KNOWN_SAJU_CASES.length).toBeGreaterThanOrEqual(10);
  });

  it('모든 케이스가 필수 필드를 가진다', () => {
    for (const testCase of KNOWN_SAJU_CASES) {
      expect(testCase.id).toBeTruthy();
      expect(testCase.description).toBeTruthy();
      expect(testCase.category).toBeTruthy();
      expect(testCase.input).toBeTruthy();
      expect(testCase.expected).toBeTruthy();
      expect(testCase.expected.year).toBeTruthy();
      expect(testCase.expected.month).toBeTruthy();
      expect(testCase.expected.day).toBeTruthy();
      expect(testCase.expected.hour).toBeTruthy();
    }
  });

  it('경계 조건 카테고리가 골고루 포함된다', () => {
    const categories = new Set(KNOWN_SAJU_CASES.map(c => c.category));
    expect(categories.has('general')).toBe(true);
    expect(categories.has('ipchun')).toBe(true);
    expect(categories.has('midnight')).toBe(true);
    expect(categories.has('leap-month')).toBe(true);
    expect(categories.has('year-boundary')).toBe(true);
    expect(categories.has('data-boundary')).toBe(true);
  });
});
