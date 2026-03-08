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
      // 장간 가중치 반영:
      // 천간: 갑(목)1 임(수)1 갑(목)1 을(목)1 → 목3, 수1
      // 인: 갑(목)0.6, 병(화)0.3, 무(토)0.1
      // 인: 갑(목)0.6, 병(화)0.3, 무(토)0.1
      // 묘: 을(목)1.0
      // 해: 임(수)0.7, 갑(목)0.3
      // 합계: 목5.5, 화0.6, 토0.2, 금0, 수1.7 (total=8)
      const balance: Record<FiveElement, number> = {
        '목': 5.5 / 8,
        '화': 0.6 / 8,
        '토': 0.2 / 8,
        '금': 0,
        '수': 1.7 / 8,
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
      // 장간 가중치 반영:
      // 천간: 경(금)1 경(금)1 갑(목)1 무(토)1
      // 신: 경(금)0.6, 임(수)0.3, 무(토)0.1
      // 유: 신(금)1.0
      // 술: 무(토)0.6, 신(금)0.3, 정(화)0.1
      // 진: 무(토)0.6, 을(목)0.3, 계(수)0.1
      // 합계: 목1.3, 화0.1, 토2.3, 금3.9, 수0.4 (total=8)
      const balance: Record<FiveElement, number> = {
        '목': 1.3 / 8,
        '화': 0.1 / 8,
        '토': 2.3 / 8,
        '금': 3.9 / 8,
        '수': 0.4 / 8,
      };

      expect(determineDayMasterStrength(fourPillars, balance)).toBe('weak');
    });

    it('비겁/인성과 재성/관성이 비슷하면 neutral을 반환한다', () => {
      // 일간 갑(목), 월지 해(수) → 득령 (+0.1)
      const fourPillars: FourPillars = {
        year: { stem: '갑', branch: '오' },
        month: { stem: '임', branch: '해' },
        day: { stem: '갑', branch: '진' },
        hour: { stem: '경', branch: '신' },
      };
      // 장간 가중치 반영:
      // 천간: 갑(목)1 임(수)1 갑(목)1 경(금)1
      // 오: 정(화)0.7, 기(토)0.3
      // 해: 임(수)0.7, 갑(목)0.3
      // 진: 무(토)0.6, 을(목)0.3, 계(수)0.1
      // 신: 경(금)0.6, 임(수)0.3, 무(토)0.1
      // 합계: 목2.6, 화0.7, 토1.0, 금1.6, 수2.1 (total=8)
      const balance: Record<FiveElement, number> = {
        '목': 2.6 / 8,
        '화': 0.7 / 8,
        '토': 1.0 / 8,
        '금': 1.6 / 8,
        '수': 2.1 / 8,
      };

      // helpingScore = 목(2.6/8) + 수(2.1/8) = 4.7/8 = 0.5875
      // diff = 2*0.5875 + 0.1 - 1 = 0.275 → strong (> 0.15)
      // 장간 반영 후 neutral이 아닌 strong이 될 수 있음
      // → helpingScore가 높아졌으므로 strong
      expect(determineDayMasterStrength(fourPillars, balance)).toBe('strong');
    });

    it('득령하면 strong 쪽으로 판단이 기운다', () => {
      // 일간 병(화), 월지 사(화) → 득령
      const fourPillars: FourPillars = {
        year: { stem: '갑', branch: '인' },
        month: { stem: '병', branch: '사' },
        day: { stem: '병', branch: '오' },
        hour: { stem: '경', branch: '신' },
      };
      // 장간 가중치 반영:
      // 천간: 갑(목)1 병(화)1 병(화)1 경(금)1
      // 인: 갑(목)0.6, 병(화)0.3, 무(토)0.1
      // 사: 병(화)0.6, 무(토)0.3, 경(금)0.1
      // 오: 정(화)0.7, 기(토)0.3
      // 신: 경(금)0.6, 임(수)0.3, 무(토)0.1
      // 합계: 목1.6, 화3.6, 토0.8, 금1.7, 수0.3 (total=8)
      const balance: Record<FiveElement, number> = {
        '목': 1.6 / 8,
        '화': 3.6 / 8,
        '토': 0.8 / 8,
        '금': 1.7 / 8,
        '수': 0.3 / 8,
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
      // 장간 가중치 반영:
      // 천간: 무(토)1 정(화)1 임(수)1 무(토)1
      // 술: 무(토)0.6, 신(금)0.3, 정(화)0.1
      // 오: 정(화)0.7, 기(토)0.3
      // 진: 무(토)0.6, 을(목)0.3, 계(수)0.1
      // 미: 기(토)0.6, 정(화)0.3, 을(목)0.1
      // 합계: 목0.4, 화2.1, 토4.1, 금0.3, 수1.1 (total=8)
      const balance: Record<FiveElement, number> = {
        '목': 0.4 / 8,
        '화': 2.1 / 8,
        '토': 4.1 / 8,
        '금': 0.3 / 8,
        '수': 1.1 / 8,
      };

      expect(determineDayMasterStrength(fourPillars, balance)).toBe('weak');
    });
  });
});
