import { describe, it, expect } from 'vitest';
import { calculateElementBalance } from '@/engine/analysis/element-balance.js';
import type { FourPillars, FiveElement } from '@/engine/types/index.js';

describe('element-balance (오행 균형)', () => {
  describe('calculateElementBalance', () => {
    it('사주 8글자의 오행 비율을 장간 가중치 반영하여 반환한다', () => {
      // 1990년 5월 15일 14시 (general-001)
      // 경오 / 신사 / 경진 / 계미
      // 천간: 경(금)1.0 신(금)1.0 경(금)1.0 계(수)1.0 → 금3.0, 수1.0
      // 오: 정(화)0.7, 기(토)0.3
      // 사: 병(화)0.6, 무(토)0.3, 경(금)0.1
      // 진: 무(토)0.6, 을(목)0.3, 계(수)0.1
      // 미: 기(토)0.6, 정(화)0.3, 을(목)0.1
      // 합계: 목0.4, 화1.6, 토1.8, 금3.1, 수1.1 (total=8.0)
      const fourPillars: FourPillars = {
        year: { stem: '경', branch: '오' },
        month: { stem: '신', branch: '사' },
        day: { stem: '경', branch: '진' },
        hour: { stem: '계', branch: '미' },
      };

      const result = calculateElementBalance(fourPillars);

      expect(result['목']).toBeCloseTo(0.4 / 8, 5);
      expect(result['화']).toBeCloseTo(1.6 / 8, 5);
      expect(result['토']).toBeCloseTo(1.8 / 8, 5);
      expect(result['금']).toBeCloseTo(3.1 / 8, 5);
      expect(result['수']).toBeCloseTo(1.1 / 8, 5);
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

    it('오행이 고루 분포된 사주를 장간 가중치로 계산한다', () => {
      // 갑자 / 병인 / 무오 / 경신
      // 천간: 갑(목)1.0 병(화)1.0 무(토)1.0 경(금)1.0
      // 자: 계(수)1.0
      // 인: 갑(목)0.6, 병(화)0.3, 무(토)0.1
      // 오: 정(화)0.7, 기(토)0.3
      // 신: 경(금)0.6, 임(수)0.3, 무(토)0.1
      // 합계: 목1.6, 화2.0, 토1.5, 금1.6, 수1.3 (total=8.0)
      const fourPillars: FourPillars = {
        year: { stem: '갑', branch: '자' },
        month: { stem: '병', branch: '인' },
        day: { stem: '무', branch: '오' },
        hour: { stem: '경', branch: '신' },
      };

      const result = calculateElementBalance(fourPillars);

      expect(result['목']).toBeCloseTo(1.6 / 8, 5);
      expect(result['화']).toBeCloseTo(2.0 / 8, 5);
      expect(result['토']).toBeCloseTo(1.5 / 8, 5);
      expect(result['금']).toBeCloseTo(1.6 / 8, 5);
      expect(result['수']).toBeCloseTo(1.3 / 8, 5);
    });

    it('장간 가중치 반영 후에도 없는 오행은 0에 가깝다', () => {
      // 병오 / 기사 / 무진 / 정미
      // 천간: 병(화)1.0 기(토)1.0 무(토)1.0 정(화)1.0
      // 오: 정(화)0.7, 기(토)0.3
      // 사: 병(화)0.6, 무(토)0.3, 경(금)0.1
      // 진: 무(토)0.6, 을(목)0.3, 계(수)0.1
      // 미: 기(토)0.6, 정(화)0.3, 을(목)0.1
      // 합계: 목0.4, 화3.6, 토3.8, 금0.1, 수0.1 (total=8.0)
      const fourPillars: FourPillars = {
        year: { stem: '병', branch: '오' },
        month: { stem: '기', branch: '사' },
        day: { stem: '무', branch: '진' },
        hour: { stem: '정', branch: '미' },
      };

      const result = calculateElementBalance(fourPillars);

      expect(result['목']).toBeCloseTo(0.4 / 8, 5);
      expect(result['화']).toBeCloseTo(3.6 / 8, 5);
      expect(result['토']).toBeCloseTo(3.8 / 8, 5);
      expect(result['금']).toBeCloseTo(0.1 / 8, 5);
      expect(result['수']).toBeCloseTo(0.1 / 8, 5);
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
