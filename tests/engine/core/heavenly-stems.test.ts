import { describe, it, expect } from 'vitest';
import {
  HEAVENLY_STEMS,
  getStemElement,
  getStemYinYang,
  getStemIndex,
  getStemByIndex,
} from '@/engine/core/heavenly-stems.js';
import type { HeavenlyStem, FiveElement } from '@/engine/types/index.js';

describe('heavenly-stems (천간)', () => {
  describe('HEAVENLY_STEMS', () => {
    it('천간 10개를 순서대로 포함한다', () => {
      expect(HEAVENLY_STEMS).toEqual(['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계']);
    });

    it('길이가 10이다', () => {
      expect(HEAVENLY_STEMS).toHaveLength(10);
    });
  });

  describe('getStemElement', () => {
    const cases: [HeavenlyStem, FiveElement][] = [
      ['갑', '목'], ['을', '목'],
      ['병', '화'], ['정', '화'],
      ['무', '토'], ['기', '토'],
      ['경', '금'], ['신', '금'],
      ['임', '수'], ['계', '수'],
    ];

    it.each(cases)('%s의 오행은 %s이다', (stem, expected) => {
      expect(getStemElement(stem)).toBe(expected);
    });
  });

  describe('getStemYinYang', () => {
    const yangStems: HeavenlyStem[] = ['갑', '병', '무', '경', '임'];
    const yinStems: HeavenlyStem[] = ['을', '정', '기', '신', '계'];

    it.each(yangStems)('%s은 양이다', (stem) => {
      expect(getStemYinYang(stem)).toBe('양');
    });

    it.each(yinStems)('%s은 음이다', (stem) => {
      expect(getStemYinYang(stem)).toBe('음');
    });
  });

  describe('getStemIndex', () => {
    it('각 천간의 인덱스를 반환한다', () => {
      const stems: HeavenlyStem[] = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
      stems.forEach((stem, i) => {
        expect(getStemIndex(stem)).toBe(i);
      });
    });
  });

  describe('getStemByIndex', () => {
    it('인덱스로 천간을 반환한다', () => {
      const expected: HeavenlyStem[] = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
      expected.forEach((stem, i) => {
        expect(getStemByIndex(i)).toBe(stem);
      });
    });

    it('범위 밖 인덱스는 모듈러 연산으로 처리한다', () => {
      expect(getStemByIndex(10)).toBe('갑');
      expect(getStemByIndex(11)).toBe('을');
      expect(getStemByIndex(-1)).toBe('계');
    });
  });
});
