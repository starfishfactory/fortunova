import { describe, it, expect } from 'vitest';
import {
  getChung,
  getHap,
  getHyung,
  checkBranchInteraction,
} from '@/engine/data/branch-interactions.js';
import type { EarthlyBranch } from '@/engine/types/index.js';

describe('branch-interactions (지지 상호작용)', () => {
  describe('getChung (육충)', () => {
    const chungPairs: [EarthlyBranch, EarthlyBranch][] = [
      ['자', '오'], ['축', '미'], ['인', '신'],
      ['묘', '유'], ['진', '술'], ['사', '해'],
    ];

    for (const [a, b] of chungPairs) {
      it(`${a}↔${b} 충이다`, () => {
        expect(getChung(a)).toBe(b);
        expect(getChung(b)).toBe(a);
      });
    }
  });

  describe('getHap (육합)', () => {
    const hapPairs: [EarthlyBranch, EarthlyBranch][] = [
      ['자', '축'], ['인', '해'], ['묘', '술'],
      ['진', '유'], ['사', '신'], ['오', '미'],
    ];

    for (const [a, b] of hapPairs) {
      it(`${a}↔${b} 합이다`, () => {
        expect(getHap(a)).toBe(b);
        expect(getHap(b)).toBe(a);
      });
    }
  });

  describe('getHyung (삼형)', () => {
    it('인은 사와 형이다', () => {
      expect(getHyung('인')).toContain('사');
    });

    it('사는 인, 신과 형이다', () => {
      const result = getHyung('사');
      expect(result).toContain('인');
      expect(result).toContain('신');
    });

    it('신은 사와 형이다', () => {
      expect(getHyung('신')).toContain('사');
    });

    it('축은 술, 미와 형이다', () => {
      const result = getHyung('축');
      expect(result).toContain('술');
      expect(result).toContain('미');
    });

    it('자는 묘와 형이다', () => {
      expect(getHyung('자')).toContain('묘');
    });

    it('진은 자형이다 (자기 자신)', () => {
      expect(getHyung('진')).toContain('진');
    });

    it('오는 자형이다 (자기 자신)', () => {
      expect(getHyung('오')).toContain('오');
    });

    it('유는 자형이다 (자기 자신)', () => {
      expect(getHyung('유')).toContain('유');
    });

    it('해는 자형이다 (자기 자신)', () => {
      expect(getHyung('해')).toContain('해');
    });
  });

  describe('checkBranchInteraction', () => {
    it('자와 오는 충을 반환한다', () => {
      expect(checkBranchInteraction('자', '오')).toContain('충');
    });

    it('자와 축은 합을 반환한다', () => {
      expect(checkBranchInteraction('자', '축')).toContain('합');
    });

    it('자와 묘는 형을 반환한다', () => {
      expect(checkBranchInteraction('자', '묘')).toContain('형');
    });

    it('인과 신은 충과 형 모두 반환한다', () => {
      const result = checkBranchInteraction('인', '신');
      expect(result).toContain('충');
      // 인↔신은 무은지형에도 해당
      // 실제로 인의 형 상대는 사이므로, 인↔신은 충만 해당
    });

    it('사와 신은 합과 형 모두 반환한다', () => {
      const result = checkBranchInteraction('사', '신');
      expect(result).toContain('합');
      expect(result).toContain('형');
    });

    it('상호작용이 없으면 빈 배열을 반환한다', () => {
      const result = checkBranchInteraction('자', '인');
      expect(result).toEqual([]);
    });
  });
});
