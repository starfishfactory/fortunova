import { describe, it, expect } from 'vitest';
import { getTenGod, mapFourPillarsTenGods } from '@/engine/analysis/ten-gods.js';
import type { HeavenlyStem, FourPillars } from '@/engine/types/index.js';
import type { TenGod } from '@/engine/types/analysis.js';

describe('ten-gods (십신)', () => {
  describe('getTenGod', () => {
    // 일간이 갑(목/양)일 때
    describe('일간 갑(목/양) 기준', () => {
      const dayStem: HeavenlyStem = '갑';

      it('갑(목/양)은 비견이다', () => {
        expect(getTenGod(dayStem, '갑')).toBe('비견');
      });

      it('을(목/음)은 겁재이다', () => {
        expect(getTenGod(dayStem, '을')).toBe('겁재');
      });

      it('병(화/양)은 식신이다', () => {
        expect(getTenGod(dayStem, '병')).toBe('식신');
      });

      it('정(화/음)은 상관이다', () => {
        expect(getTenGod(dayStem, '정')).toBe('상관');
      });

      it('무(토/양)은 편재이다', () => {
        expect(getTenGod(dayStem, '무')).toBe('편재');
      });

      it('기(토/음)은 정재이다', () => {
        expect(getTenGod(dayStem, '기')).toBe('정재');
      });

      it('경(금/양)은 편관이다', () => {
        expect(getTenGod(dayStem, '경')).toBe('편관');
      });

      it('신(금/음)은 정관이다', () => {
        expect(getTenGod(dayStem, '신')).toBe('정관');
      });

      it('임(수/양)은 편인이다', () => {
        expect(getTenGod(dayStem, '임')).toBe('편인');
      });

      it('계(수/음)은 정인이다', () => {
        expect(getTenGod(dayStem, '계')).toBe('정인');
      });
    });

    // 일간이 정(화/음)일 때 - 음간 케이스 확인
    describe('일간 정(화/음) 기준', () => {
      const dayStem: HeavenlyStem = '정';

      it('정(화/음)은 비견이다', () => {
        expect(getTenGod(dayStem, '정')).toBe('비견');
      });

      it('병(화/양)은 겁재이다', () => {
        expect(getTenGod(dayStem, '병')).toBe('겁재');
      });

      it('기(토/음)은 식신이다', () => {
        expect(getTenGod(dayStem, '기')).toBe('식신');
      });

      it('무(토/양)은 상관이다', () => {
        expect(getTenGod(dayStem, '무')).toBe('상관');
      });

      it('신(금/음)은 편재이다', () => {
        expect(getTenGod(dayStem, '신')).toBe('편재');
      });

      it('경(금/양)은 정재이다', () => {
        expect(getTenGod(dayStem, '경')).toBe('정재');
      });

      it('계(수/음)은 편관이다', () => {
        expect(getTenGod(dayStem, '계')).toBe('편관');
      });

      it('임(수/양)은 정관이다', () => {
        expect(getTenGod(dayStem, '임')).toBe('정관');
      });

      it('을(목/음)은 편인이다', () => {
        expect(getTenGod(dayStem, '을')).toBe('편인');
      });

      it('갑(목/양)은 정인이다', () => {
        expect(getTenGod(dayStem, '갑')).toBe('정인');
      });
    });

    // 전체 천간에 대해 비견 테스트
    describe('모든 일간에 대해 비견을 반환한다', () => {
      const stems: HeavenlyStem[] = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];

      it.each(stems)('일간 %s → 비견', (stem) => {
        expect(getTenGod(stem, stem)).toBe('비견');
      });
    });
  });

  describe('mapFourPillarsTenGods', () => {
    it('사주팔자의 각 천간에 대한 십신을 반환한다', () => {
      // 1990년 5월 15일 14시 남성 (general-001)
      // 일간 경(금/양)
      const fourPillars: FourPillars = {
        year: { stem: '경', branch: '오' },
        month: { stem: '신', branch: '사' },
        day: { stem: '경', branch: '진' },
        hour: { stem: '계', branch: '미' },
      };

      const result = mapFourPillarsTenGods(fourPillars);

      expect(result['yearStem']).toBe('비견');
      expect(result['monthStem']).toBe('겁재');
      expect(result['hourStem']).toBe('상관');
    });

    it('일간 자체는 매핑에 포함하지 않는다', () => {
      const fourPillars: FourPillars = {
        year: { stem: '갑', branch: '자' },
        month: { stem: '병', branch: '인' },
        day: { stem: '갑', branch: '오' },
        hour: { stem: '무', branch: '진' },
      };

      const result = mapFourPillarsTenGods(fourPillars);
      expect(result['dayStem']).toBeUndefined();
    });

    it('지지의 본기 오행 기준으로 십신을 매핑한다', () => {
      // 일간 갑(목/양)
      const fourPillars: FourPillars = {
        year: { stem: '갑', branch: '자' },
        month: { stem: '병', branch: '인' },
        day: { stem: '갑', branch: '오' },
        hour: { stem: '무', branch: '유' },
      };

      const result = mapFourPillarsTenGods(fourPillars);

      // 년지 자(수/양) → 편인
      expect(result['yearBranch']).toBe('편인');
      // 월지 인(목/양) → 비견
      expect(result['monthBranch']).toBe('비견');
      // 일지 오(화/양) → 식신
      expect(result['dayBranch']).toBe('식신');
      // 시지 유(금/음) → 정관
      expect(result['hourBranch']).toBe('정관');
    });
  });
});
