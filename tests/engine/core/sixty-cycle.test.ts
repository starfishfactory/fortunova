import { describe, it, expect } from 'vitest';
import {
  SIXTY_CYCLE,
  getGanJiByIndex,
  getIndexByGanJi,
  getNextGanJi,
  getPrevGanJi,
} from '@/engine/core/sixty-cycle.js';
import type { GanJi } from '@/engine/types/index.js';
import { HEAVENLY_STEMS } from '@/engine/core/heavenly-stems.js';
import { EARTHLY_BRANCHES } from '@/engine/core/earthly-branches.js';

describe('sixty-cycle (60갑자)', () => {
  describe('SIXTY_CYCLE', () => {
    it('60개의 간지 조합을 포함한다', () => {
      expect(SIXTY_CYCLE).toHaveLength(60);
    });

    it('첫 번째는 갑자이다', () => {
      expect(SIXTY_CYCLE[0]).toEqual({ stem: '갑', branch: '자' });
    });

    it('마지막은 계해이다', () => {
      expect(SIXTY_CYCLE[59]).toEqual({ stem: '계', branch: '해' });
    });

    it('천간[i%10] + 지지[i%12] 규칙을 따른다', () => {
      SIXTY_CYCLE.forEach((ganJi, i) => {
        expect(ganJi.stem).toBe(HEAVENLY_STEMS[i % 10]);
        expect(ganJi.branch).toBe(EARTHLY_BRANCHES[i % 12]);
      });
    });

    it('중복이 없다', () => {
      const keys = SIXTY_CYCLE.map((g) => `${g.stem}${g.branch}`);
      const unique = new Set(keys);
      expect(unique.size).toBe(60);
    });
  });

  describe('getGanJiByIndex', () => {
    it('인덱스 0은 갑자이다', () => {
      expect(getGanJiByIndex(0)).toEqual({ stem: '갑', branch: '자' });
    });

    it('인덱스 1은 을축이다', () => {
      expect(getGanJiByIndex(1)).toEqual({ stem: '을', branch: '축' });
    });

    it('인덱스 59는 계해이다', () => {
      expect(getGanJiByIndex(59)).toEqual({ stem: '계', branch: '해' });
    });

    it('범위 밖 인덱스는 모듈러 연산으로 처리한다', () => {
      expect(getGanJiByIndex(60)).toEqual({ stem: '갑', branch: '자' });
      expect(getGanJiByIndex(-1)).toEqual({ stem: '계', branch: '해' });
    });
  });

  describe('getIndexByGanJi', () => {
    it('갑자는 인덱스 0이다', () => {
      expect(getIndexByGanJi({ stem: '갑', branch: '자' })).toBe(0);
    });

    it('을축은 인덱스 1이다', () => {
      expect(getIndexByGanJi({ stem: '을', branch: '축' })).toBe(1);
    });

    it('계해는 인덱스 59이다', () => {
      expect(getIndexByGanJi({ stem: '계', branch: '해' })).toBe(59);
    });

    it('모든 60갑자의 인덱스가 정확하다', () => {
      SIXTY_CYCLE.forEach((ganJi, i) => {
        expect(getIndexByGanJi(ganJi)).toBe(i);
      });
    });
  });

  describe('getNextGanJi', () => {
    it('갑자 다음은 을축이다', () => {
      expect(getNextGanJi({ stem: '갑', branch: '자' })).toEqual({ stem: '을', branch: '축' });
    });

    it('계해 다음은 갑자이다 (순환)', () => {
      expect(getNextGanJi({ stem: '계', branch: '해' })).toEqual({ stem: '갑', branch: '자' });
    });
  });

  describe('getPrevGanJi', () => {
    it('을축 이전은 갑자이다', () => {
      expect(getPrevGanJi({ stem: '을', branch: '축' })).toEqual({ stem: '갑', branch: '자' });
    });

    it('갑자 이전은 계해이다 (순환)', () => {
      expect(getPrevGanJi({ stem: '갑', branch: '자' })).toEqual({ stem: '계', branch: '해' });
    });
  });

  describe('순환 검증', () => {
    it('60번 next를 반복하면 원래로 돌아온다', () => {
      let current: GanJi = { stem: '갑', branch: '자' };
      for (let i = 0; i < 60; i++) {
        current = getNextGanJi(current);
      }
      expect(current).toEqual({ stem: '갑', branch: '자' });
    });

    it('60번 prev를 반복하면 원래로 돌아온다', () => {
      let current: GanJi = { stem: '갑', branch: '자' };
      for (let i = 0; i < 60; i++) {
        current = getPrevGanJi(current);
      }
      expect(current).toEqual({ stem: '갑', branch: '자' });
    });
  });
});
