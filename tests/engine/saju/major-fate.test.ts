import { describe, it, expect } from 'vitest';
import { calculateMajorFate } from '@/engine/saju/major-fate.js';
import type { FourPillars } from '@/engine/types/index.js';

describe('major-fate (대운)', () => {
  describe('calculateMajorFate', () => {
    it('8개의 대운을 반환한다 (80년)', () => {
      const fourPillars: FourPillars = {
        year: { stem: '경', branch: '오' },
        month: { stem: '신', branch: '사' },
        day: { stem: '경', branch: '진' },
        hour: { stem: '계', branch: '미' },
      };

      const result = calculateMajorFate(fourPillars, 'M', 1990);
      expect(result).toHaveLength(8);
    });

    it('각 대운은 10년 주기이다', () => {
      const fourPillars: FourPillars = {
        year: { stem: '경', branch: '오' },
        month: { stem: '신', branch: '사' },
        day: { stem: '경', branch: '진' },
        hour: { stem: '계', branch: '미' },
      };

      const result = calculateMajorFate(fourPillars, 'M', 1990);

      for (const period of result) {
        expect(period.endAge - period.startAge).toBe(10);
      }
    });

    it('남자 양년생은 순행한다 (월주 다음 간지부터)', () => {
      // 1990년 경오(양년), 남자 → 순행
      // 월주: 신사 → 다음: 임오, 계미, 갑신, ...
      const fourPillars: FourPillars = {
        year: { stem: '경', branch: '오' },
        month: { stem: '신', branch: '사' },
        day: { stem: '경', branch: '진' },
        hour: { stem: '계', branch: '미' },
      };

      const result = calculateMajorFate(fourPillars, 'M', 1990);

      expect(result[0].ganJi).toEqual({ stem: '임', branch: '오' });
      expect(result[1].ganJi).toEqual({ stem: '계', branch: '미' });
      expect(result[2].ganJi).toEqual({ stem: '갑', branch: '신' });
    });

    it('남자 음년생은 역행한다 (월주 이전 간지부터)', () => {
      // 1985년 을축(음년), 남자 → 역행
      // 월주: 을유 → 이전: 갑신, 계미, 임오, ...
      const fourPillars: FourPillars = {
        year: { stem: '을', branch: '축' },
        month: { stem: '을', branch: '유' },
        day: { stem: '계', branch: '유' },
        hour: { stem: '병', branch: '진' },
      };

      const result = calculateMajorFate(fourPillars, 'M', 1985);

      expect(result[0].ganJi).toEqual({ stem: '갑', branch: '신' });
      expect(result[1].ganJi).toEqual({ stem: '계', branch: '미' });
      expect(result[2].ganJi).toEqual({ stem: '임', branch: '오' });
    });

    it('여자 음년생은 순행한다', () => {
      // 1985년 을축(음년), 여자 → 순행
      // 월주: 을유 → 다음: 병술, 정해, ...
      const fourPillars: FourPillars = {
        year: { stem: '을', branch: '축' },
        month: { stem: '을', branch: '유' },
        day: { stem: '계', branch: '유' },
        hour: { stem: '병', branch: '진' },
      };

      const result = calculateMajorFate(fourPillars, 'F', 1985);

      expect(result[0].ganJi).toEqual({ stem: '병', branch: '술' });
      expect(result[1].ganJi).toEqual({ stem: '정', branch: '해' });
    });

    it('여자 양년생은 역행한다', () => {
      // 2024년 갑진(양년), 여자 → 역행
      // 월주: 병인 → 이전: 을축, 갑자, ...
      const fourPillars: FourPillars = {
        year: { stem: '갑', branch: '진' },
        month: { stem: '병', branch: '인' },
        day: { stem: '기', branch: '해' },
        hour: { stem: '기', branch: '사' },
      };

      const result = calculateMajorFate(fourPillars, 'F', 2024);

      expect(result[0].ganJi).toEqual({ stem: '을', branch: '축' });
      expect(result[1].ganJi).toEqual({ stem: '갑', branch: '자' });
    });

    it('대운의 나이 범위가 연속적이다', () => {
      const fourPillars: FourPillars = {
        year: { stem: '경', branch: '오' },
        month: { stem: '신', branch: '사' },
        day: { stem: '경', branch: '진' },
        hour: { stem: '계', branch: '미' },
      };

      const result = calculateMajorFate(fourPillars, 'M', 1990);

      for (let i = 1; i < result.length; i++) {
        expect(result[i].startAge).toBe(result[i - 1].endAge);
      }
    });

    it('첫 대운은 0세 이후에 시작한다', () => {
      const fourPillars: FourPillars = {
        year: { stem: '경', branch: '오' },
        month: { stem: '신', branch: '사' },
        day: { stem: '경', branch: '진' },
        hour: { stem: '계', branch: '미' },
      };

      const result = calculateMajorFate(fourPillars, 'M', 1990);
      expect(result[0].startAge).toBeGreaterThanOrEqual(0);
    });
  });
});
