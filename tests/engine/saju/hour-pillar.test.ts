import { describe, it, expect } from 'vitest';
import { calculateHourPillar } from '@/engine/saju/hour-pillar.js';

import { KNOWN_SAJU_CASES } from '../../fixtures/known-saju-cases.js';

describe('calculateHourPillar', () => {
  it('hour가 null이면 null을 반환한다', () => {
    expect(calculateHourPillar(null, '갑')).toBeNull();
  });

  it('갑일 14시 → 신미를 반환한다 (general-001)', () => {
    const result = calculateHourPillar(14, '갑');
    expect(result).toEqual({ stem: '신', branch: '미' });
  });

  it('기일 8시 → 무진을 반환한다 (general-002)', () => {
    const result = calculateHourPillar(8, '기');
    expect(result).toEqual({ stem: '무', branch: '진' });
  });

  it('갑일 10시 → 기사를 반환한다 (ipchun-001)', () => {
    const result = calculateHourPillar(10, '갑');
    expect(result).toEqual({ stem: '기', branch: '사' });
  });

  it('병일 10시 → 계사를 반환한다 (ipchun-002)', () => {
    const result = calculateHourPillar(10, '병');
    expect(result).toEqual({ stem: '계', branch: '사' });
  });

  it('기일 23시(야자시) → 갑자를 반환한다 (midnight-001)', () => {
    const result = calculateHourPillar(23, '기');
    expect(result).toEqual({ stem: '갑', branch: '자' });
  });

  it('경일 12시 → 임오를 반환한다 (leap-month-001)', () => {
    const result = calculateHourPillar(12, '경');
    expect(result).toEqual({ stem: '임', branch: '오' });
  });

  it('임일 12시 → 병오를 반환한다 (year-boundary-001)', () => {
    const result = calculateHourPillar(12, '임');
    expect(result).toEqual({ stem: '병', branch: '오' });
  });

  it('임일 6시 → 계묘를 반환한다 (data-boundary-001)', () => {
    const result = calculateHourPillar(6, '임');
    expect(result).toEqual({ stem: '계', branch: '묘' });
  });

  it('경일 15시 → 갑신을 반환한다 (data-boundary-002)', () => {
    const result = calculateHourPillar(15, '경');
    expect(result).toEqual({ stem: '갑', branch: '신' });
  });

  it('갑일 12시 → 경오를 반환한다 (general-003)', () => {
    const result = calculateHourPillar(12, '갑');
    expect(result).toEqual({ stem: '경', branch: '오' });
  });

  it('0시(조자시) → 시지가 자가 된다', () => {
    const result = calculateHourPillar(0, '갑');
    expect(result).toEqual({ stem: '갑', branch: '자' });
  });

  describe('fixture 교차검증', () => {
    const casesWithHour = KNOWN_SAJU_CASES.filter((c) => c.input.hour !== null);

    for (const testCase of casesWithHour) {
      it(`${testCase.id}: ${testCase.description} → 시주 ${testCase.expected.hour.stem}${testCase.expected.hour.branch}`, () => {
        const result = calculateHourPillar(
          testCase.input.hour,
          testCase.expected.day.stem,
        );
        expect(result).toEqual(testCase.expected.hour);
      });
    }
  });
});
