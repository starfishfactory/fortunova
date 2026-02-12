import { describe, it, expect } from 'vitest';
import { determineDayMasterStrength } from '@/engine/analysis/day-master-strength.js';
import type { FourPillars, FiveElement } from '@/engine/types/index.js';

describe('day-master-strength (일간 강약)', () => {
  describe('determineDayMasterStrength', () => {
    it('비겁/인성 비율이 높고 득령하면 strong을 반환한다', () => {
      // 일간 갑(목), 월지 인(목) → 득령
      const fourPillars: FourPillars = {
        year: { stem: '갑', branch: '인' },
        month: { stem: '임', branch: '인' },
        day: { stem: '갑', branch: '묘' },
        hour: { stem: '을', branch: '해' },
      };
      // 목5 수2 화0 토0 금0 (총8은 아니지만 비율로 제공)
      const balance: Record<FiveElement, number> = {
        '목': 5 / 8,
        '화': 0,
        '토': 0,
        '금': 0,
        '수': 2 / 8,
      };

      expect(determineDayMasterStrength(fourPillars, balance)).toBe('strong');
    });

    it('재성/관성 비율이 높고 실령하면 weak을 반환한다', () => {
      // 일간 갑(목), 월지 유(금) → 실령
      const fourPillars: FourPillars = {
        year: { stem: '경', branch: '신' },
        month: { stem: '경', branch: '유' },
        day: { stem: '갑', branch: '술' },
        hour: { stem: '무', branch: '진' },
      };
      // 목1 화0 토3 금3 수0
      const balance: Record<FiveElement, number> = {
        '목': 1 / 8,
        '화': 0,
        '토': 3 / 8,
        '금': 3 / 8,
        '수': 0,
      };

      expect(determineDayMasterStrength(fourPillars, balance)).toBe('weak');
    });

    it('비겁/인성과 재성/관성이 비슷하면 neutral을 반환한다', () => {
      // 일간 갑(목), 월지 해(수) → 득령 (+0.1)
      // helpingScore = 목(2/8) + 수(2/8) = 0.5
      // diff = 2*0.5 + 0.1 - 1 = 0.1 → neutral (±0.15 이내)
      const fourPillars: FourPillars = {
        year: { stem: '갑', branch: '오' },
        month: { stem: '임', branch: '해' },
        day: { stem: '갑', branch: '진' },
        hour: { stem: '경', branch: '신' },
      };
      // 목2 화1 토1 금2 수2
      const balance: Record<FiveElement, number> = {
        '목': 2 / 8,
        '화': 1 / 8,
        '토': 1 / 8,
        '금': 2 / 8,
        '수': 2 / 8,
      };

      expect(determineDayMasterStrength(fourPillars, balance)).toBe('neutral');
    });

    it('득령하면 strong 쪽으로 판단이 기운다', () => {
      // 일간 병(화), 월지 사(화) → 득령
      const fourPillars: FourPillars = {
        year: { stem: '갑', branch: '인' },
        month: { stem: '병', branch: '사' },
        day: { stem: '병', branch: '오' },
        hour: { stem: '경', branch: '신' },
      };
      // 목2 화4 토0 금2 수0
      const balance: Record<FiveElement, number> = {
        '목': 2 / 8,
        '화': 4 / 8,
        '토': 0,
        '금': 2 / 8,
        '수': 0,
      };

      expect(determineDayMasterStrength(fourPillars, balance)).toBe('strong');
    });

    it('실령하면 weak 쪽으로 판단이 기운다', () => {
      // 일간 임(수), 월지 오(화) → 실령
      const fourPillars: FourPillars = {
        year: { stem: '무', branch: '술' },
        month: { stem: '정', branch: '오' },
        day: { stem: '임', branch: '진' },
        hour: { stem: '무', branch: '미' },
      };
      // 목0 화2 토4 금0 수1
      const balance: Record<FiveElement, number> = {
        '목': 0,
        '화': 2 / 8,
        '토': 5 / 8,
        '금': 0,
        '수': 1 / 8,
      };

      expect(determineDayMasterStrength(fourPillars, balance)).toBe('weak');
    });
  });
});
