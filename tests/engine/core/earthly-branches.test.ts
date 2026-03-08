import { describe, it, expect } from 'vitest';
import {
  EARTHLY_BRANCHES,
  getBranchElement,
  getBranchYinYang,
  getBranchIndex,
  getBranchByIndex,
  getBranchHour,
  getHourBranch,
  HIDDEN_STEMS_MAP,
  getHiddenStems,
} from '@/engine/core/earthly-branches.js';
import type { EarthlyBranch, FiveElement, HiddenStem } from '@/engine/types/index.js';

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

  describe('HIDDEN_STEMS_MAP', () => {
    it('12지지 모두에 대해 장간 매핑이 존재한다', () => {
      const branches: EarthlyBranch[] = [
        '자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해',
      ];
      for (const branch of branches) {
        expect(HIDDEN_STEMS_MAP[branch]).toBeDefined();
      }
    });

    it('자(子)의 장간은 계(본기)이다', () => {
      expect(HIDDEN_STEMS_MAP['자']).toEqual({ main: '계' });
    });

    it('축(丑)의 장간은 기(본기)/신(중기)/계(여기)이다', () => {
      expect(HIDDEN_STEMS_MAP['축']).toEqual({ main: '기', middle: '신', residual: '계' });
    });

    it('인(寅)의 장간은 갑(본기)/병(중기)/무(여기)이다', () => {
      expect(HIDDEN_STEMS_MAP['인']).toEqual({ main: '갑', middle: '병', residual: '무' });
    });

    it('묘(卯)의 장간은 을(본기)이다', () => {
      expect(HIDDEN_STEMS_MAP['묘']).toEqual({ main: '을' });
    });

    it('진(辰)의 장간은 무(본기)/을(중기)/계(여기)이다', () => {
      expect(HIDDEN_STEMS_MAP['진']).toEqual({ main: '무', middle: '을', residual: '계' });
    });

    it('사(巳)의 장간은 병(본기)/무(중기)/경(여기)이다', () => {
      expect(HIDDEN_STEMS_MAP['사']).toEqual({ main: '병', middle: '무', residual: '경' });
    });

    it('오(午)의 장간은 정(본기)/기(중기)이다', () => {
      expect(HIDDEN_STEMS_MAP['오']).toEqual({ main: '정', middle: '기' });
    });

    it('미(未)의 장간은 기(본기)/정(중기)/을(여기)이다', () => {
      expect(HIDDEN_STEMS_MAP['미']).toEqual({ main: '기', middle: '정', residual: '을' });
    });

    it('신(申)의 장간은 경(본기)/임(중기)/무(여기)이다', () => {
      expect(HIDDEN_STEMS_MAP['신']).toEqual({ main: '경', middle: '임', residual: '무' });
    });

    it('유(酉)의 장간은 신(본기)이다', () => {
      expect(HIDDEN_STEMS_MAP['유']).toEqual({ main: '신' });
    });

    it('술(戌)의 장간은 무(본기)/신(중기)/정(여기)이다', () => {
      expect(HIDDEN_STEMS_MAP['술']).toEqual({ main: '무', middle: '신', residual: '정' });
    });

    it('해(亥)의 장간은 임(본기)/갑(중기)이다', () => {
      expect(HIDDEN_STEMS_MAP['해']).toEqual({ main: '임', middle: '갑' });
    });
  });

  describe('getHiddenStems', () => {
    it('지지를 입력하면 해당 장간을 반환한다', () => {
      expect(getHiddenStems('자')).toEqual({ main: '계' });
      expect(getHiddenStems('축')).toEqual({ main: '기', middle: '신', residual: '계' });
      expect(getHiddenStems('인')).toEqual({ main: '갑', middle: '병', residual: '무' });
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
