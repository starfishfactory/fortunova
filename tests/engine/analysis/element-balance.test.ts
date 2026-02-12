import { describe, it, expect } from 'vitest';
import { calculateElementBalance } from '@/engine/analysis/element-balance.js';
import type { FourPillars, FiveElement } from '@/engine/types/index.js';

describe('element-balance (오행 균형)', () => {
  describe('calculateElementBalance', () => {
    it('사주 8글자의 오행 비율을 0~1 사이 값으로 반환한다', () => {
      // 1990년 5월 15일 14시 (general-001)
      // 경오 / 신사 / 경진 / 계미
      // 천간: 경(금) 신(금) 경(금) 계(수) → 금3, 수1
      // 지지: 오(화) 사(화) 진(토) 미(토) → 화2, 토2
      const fourPillars: FourPillars = {
        year: { stem: '경', branch: '오' },
        month: { stem: '신', branch: '사' },
        day: { stem: '경', branch: '진' },
        hour: { stem: '계', branch: '미' },
      };

      const result = calculateElementBalance(fourPillars);

      // 총 8글자: 목0, 화2, 토2, 금3, 수1
      expect(result['목']).toBeCloseTo(0 / 8, 5);
      expect(result['화']).toBeCloseTo(2 / 8, 5);
      expect(result['토']).toBeCloseTo(2 / 8, 5);
      expect(result['금']).toBeCloseTo(3 / 8, 5);
      expect(result['수']).toBeCloseTo(1 / 8, 5);
    });

    it('모든 오행의 비율 합은 1이다', () => {
      const fourPillars: FourPillars = {
        year: { stem: '갑', branch: '자' },
        month: { stem: '병', branch: '인' },
        day: { stem: '무', branch: '오' },
        hour: { stem: '경', branch: '신' },
      };

      const result = calculateElementBalance(fourPillars);

      const elements: FiveElement[] = ['목', '화', '토', '금', '수'];
      const sum = elements.reduce((acc, el) => acc + result[el], 0);
      expect(sum).toBeCloseTo(1.0, 5);
    });

    it('오행이 고루 분포된 사주를 올바르게 계산한다', () => {
      // 갑자 / 병인 / 무오 / 경신
      // 천간: 갑(목) 병(화) 무(토) 경(금)
      // 지지: 자(수) 인(목) 오(화) 신(금)
      // 목2 화2 토1 금2 수1
      const fourPillars: FourPillars = {
        year: { stem: '갑', branch: '자' },
        month: { stem: '병', branch: '인' },
        day: { stem: '무', branch: '오' },
        hour: { stem: '경', branch: '신' },
      };

      const result = calculateElementBalance(fourPillars);

      expect(result['목']).toBeCloseTo(2 / 8, 5);
      expect(result['화']).toBeCloseTo(2 / 8, 5);
      expect(result['토']).toBeCloseTo(1 / 8, 5);
      expect(result['금']).toBeCloseTo(2 / 8, 5);
      expect(result['수']).toBeCloseTo(1 / 8, 5);
    });

    it('한 오행이 없는 경우 0을 반환한다', () => {
      // 병오 / 기사 / 무진 / 정미
      // 천간: 병(화) 기(토) 무(토) 정(화)
      // 지지: 오(화) 사(화) 진(토) 미(토)
      // 목0 화4 토4 금0 수0
      const fourPillars: FourPillars = {
        year: { stem: '병', branch: '오' },
        month: { stem: '기', branch: '사' },
        day: { stem: '무', branch: '진' },
        hour: { stem: '정', branch: '미' },
      };

      const result = calculateElementBalance(fourPillars);

      expect(result['목']).toBe(0);
      expect(result['금']).toBe(0);
      expect(result['수']).toBe(0);
      expect(result['화']).toBeCloseTo(4 / 8, 5);
      expect(result['토']).toBeCloseTo(4 / 8, 5);
    });

    it('반환 객체에 5개 오행이 모두 포함된다', () => {
      const fourPillars: FourPillars = {
        year: { stem: '갑', branch: '자' },
        month: { stem: '갑', branch: '자' },
        day: { stem: '갑', branch: '자' },
        hour: { stem: '갑', branch: '자' },
      };

      const result = calculateElementBalance(fourPillars);

      expect(result).toHaveProperty('목');
      expect(result).toHaveProperty('화');
      expect(result).toHaveProperty('토');
      expect(result).toHaveProperty('금');
      expect(result).toHaveProperty('수');
    });
  });
});
