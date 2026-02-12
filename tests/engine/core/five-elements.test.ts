import { describe, it, expect } from 'vitest';
import {
  FIVE_ELEMENTS,
  getElementRelation,
  getGeneratingElement,
  getOvercomingElement,
} from '@/engine/core/five-elements.js';
import type { FiveElement } from '@/engine/types/index.js';

describe('five-elements (오행)', () => {
  describe('FIVE_ELEMENTS', () => {
    it('오행 5개를 순서대로 포함한다', () => {
      expect(FIVE_ELEMENTS).toEqual(['목', '화', '토', '금', '수']);
    });

    it('길이가 5이다', () => {
      expect(FIVE_ELEMENTS).toHaveLength(5);
    });
  });

  describe('getElementRelation', () => {
    describe('상생 관계', () => {
      const cases: [FiveElement, FiveElement][] = [
        ['목', '화'], ['화', '토'], ['토', '금'], ['금', '수'], ['수', '목'],
      ];

      it.each(cases)('%s → %s는 상생이다', (from, to) => {
        expect(getElementRelation(from, to)).toBe('상생');
      });
    });

    describe('상극 관계', () => {
      const cases: [FiveElement, FiveElement][] = [
        ['목', '토'], ['토', '수'], ['수', '화'], ['화', '금'], ['금', '목'],
      ];

      it.each(cases)('%s → %s는 상극이다', (from, to) => {
        expect(getElementRelation(from, to)).toBe('상극');
      });
    });

    describe('비화 관계', () => {
      const elements: FiveElement[] = ['목', '화', '토', '금', '수'];

      it.each(elements)('%s → %s는 비화이다', (element) => {
        expect(getElementRelation(element, element)).toBe('비화');
      });
    });

    describe('무관 관계', () => {
      const cases: [FiveElement, FiveElement][] = [
        ['목', '금'], ['목', '수'],
        ['화', '목'], ['화', '수'],
        ['토', '화'], ['토', '목'],
        ['금', '토'], ['금', '화'],
        ['수', '금'], ['수', '토'],
      ];

      it.each(cases)('%s → %s는 무관이다', (from, to) => {
        expect(getElementRelation(from, to)).toBe('무관');
      });
    });
  });

  describe('getGeneratingElement', () => {
    const cases: [FiveElement, FiveElement][] = [
      ['목', '수'],
      ['화', '목'],
      ['토', '화'],
      ['금', '토'],
      ['수', '금'],
    ];

    it.each(cases)('%s을 생하는 오행은 %s이다', (element, expected) => {
      expect(getGeneratingElement(element)).toBe(expected);
    });
  });

  describe('getOvercomingElement', () => {
    const cases: [FiveElement, FiveElement][] = [
      ['목', '금'],
      ['화', '수'],
      ['토', '목'],
      ['금', '화'],
      ['수', '토'],
    ];

    it.each(cases)('%s을 극하는 오행은 %s이다', (element, expected) => {
      expect(getOvercomingElement(element)).toBe(expected);
    });
  });
});
