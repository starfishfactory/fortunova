import { describe, it, expect } from 'vitest';
import {
  EARTHLY_BRANCHES,
  getBranchElement,
  getBranchYinYang,
  getBranchIndex,
  getBranchByIndex,
  getBranchHour,
  getHourBranch,
} from '@/engine/core/earthly-branches.js';
import type { EarthlyBranch, FiveElement } from '@/engine/types/index.js';

describe('earthly-branches (지지)', () => {
  describe('EARTHLY_BRANCHES', () => {
    it('지지 12개를 순서대로 포함한다', () => {
      expect(EARTHLY_BRANCHES).toEqual([
        '자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해',
      ]);
    });

    it('길이가 12이다', () => {
      expect(EARTHLY_BRANCHES).toHaveLength(12);
    });
  });

  describe('getBranchElement', () => {
    const cases: [EarthlyBranch, FiveElement][] = [
      ['인', '목'], ['묘', '목'],
      ['사', '화'], ['오', '화'],
      ['신', '금'], ['유', '금'],
      ['해', '수'], ['자', '수'],
      ['축', '토'], ['진', '토'], ['미', '토'], ['술', '토'],
    ];

    it.each(cases)('%s의 오행은 %s이다', (branch, expected) => {
      expect(getBranchElement(branch)).toBe(expected);
    });
  });

  describe('getBranchYinYang', () => {
    const yangBranches: EarthlyBranch[] = ['자', '인', '진', '오', '신', '술'];
    const yinBranches: EarthlyBranch[] = ['축', '묘', '사', '미', '유', '해'];

    it.each(yangBranches)('%s은 양이다', (branch) => {
      expect(getBranchYinYang(branch)).toBe('양');
    });

    it.each(yinBranches)('%s은 음이다', (branch) => {
      expect(getBranchYinYang(branch)).toBe('음');
    });
  });

  describe('getBranchIndex', () => {
    it('각 지지의 인덱스를 반환한다', () => {
      const branches: EarthlyBranch[] = [
        '자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해',
      ];
      branches.forEach((branch, i) => {
        expect(getBranchIndex(branch)).toBe(i);
      });
    });
  });

  describe('getBranchByIndex', () => {
    it('인덱스로 지지를 반환한다', () => {
      const expected: EarthlyBranch[] = [
        '자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해',
      ];
      expected.forEach((branch, i) => {
        expect(getBranchByIndex(i)).toBe(branch);
      });
    });

    it('범위 밖 인덱스는 모듈러 연산으로 처리한다', () => {
      expect(getBranchByIndex(12)).toBe('자');
      expect(getBranchByIndex(13)).toBe('축');
      expect(getBranchByIndex(-1)).toBe('해');
    });
  });

  describe('getBranchHour', () => {
    const cases: [EarthlyBranch, [number, number]][] = [
      ['자', [23, 1]],
      ['축', [1, 3]],
      ['인', [3, 5]],
      ['묘', [5, 7]],
      ['진', [7, 9]],
      ['사', [9, 11]],
      ['오', [11, 13]],
      ['미', [13, 15]],
      ['신', [15, 17]],
      ['유', [17, 19]],
      ['술', [19, 21]],
      ['해', [21, 23]],
    ];

    it.each(cases)('%s시의 시간 범위는 %s이다', (branch, expected) => {
      expect(getBranchHour(branch)).toEqual(expected);
    });
  });

  describe('getHourBranch', () => {
    it('23시는 자시이다', () => {
      expect(getHourBranch(23)).toBe('자');
    });

    it('0시는 자시이다', () => {
      expect(getHourBranch(0)).toBe('자');
    });

    it('1시는 축시이다', () => {
      expect(getHourBranch(1)).toBe('축');
    });

    it('모든 시간(0-23)에 대해 올바른 지지를 반환한다', () => {
      const expected: [number, EarthlyBranch][] = [
        [0, '자'], [1, '축'], [2, '축'],
        [3, '인'], [4, '인'],
        [5, '묘'], [6, '묘'],
        [7, '진'], [8, '진'],
        [9, '사'], [10, '사'],
        [11, '오'], [12, '오'],
        [13, '미'], [14, '미'],
        [15, '신'], [16, '신'],
        [17, '유'], [18, '유'],
        [19, '술'], [20, '술'],
        [21, '해'], [22, '해'],
        [23, '자'],
      ];

      expected.forEach(([hour, branch]) => {
        expect(getHourBranch(hour)).toBe(branch);
      });
    });
  });
});
