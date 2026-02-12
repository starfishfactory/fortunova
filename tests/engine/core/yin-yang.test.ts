import { describe, it, expect } from 'vitest';
import { isYang, isYin, getOpposite } from '@/engine/core/yin-yang.js';
import type { HeavenlyStem, EarthlyBranch } from '@/engine/types/index.js';

describe('yin-yang (음양)', () => {
  describe('isYang', () => {
    describe('천간', () => {
      const yangStems: HeavenlyStem[] = ['갑', '병', '무', '경', '임'];
      const yinStems: HeavenlyStem[] = ['을', '정', '기', '신', '계'];

      it.each(yangStems)('%s은 양이다', (stem) => {
        expect(isYang(stem)).toBe(true);
      });

      it.each(yinStems)('%s은 양이 아니다', (stem) => {
        expect(isYang(stem)).toBe(false);
      });
    });

    describe('지지', () => {
      // '신'은 천간에도 존재하므로 제외 (천간 우선 판별)
      const yangBranches: EarthlyBranch[] = ['자', '인', '진', '오', '술'];
      const yinBranches: EarthlyBranch[] = ['축', '묘', '사', '미', '유', '해'];

      it.each(yangBranches)('%s은 양이다', (branch) => {
        expect(isYang(branch)).toBe(true);
      });

      it.each(yinBranches)('%s은 양이 아니다', (branch) => {
        expect(isYang(branch)).toBe(false);
      });

      it('중복 문자 신은 천간 기준으로 판별한다 (kind로 지지 명시 가능)', () => {
        expect(isYang('신')).toBe(false); // 천간 우선
        expect(isYang('신', 'branch')).toBe(true); // 지지 명시
      });
    });
  });

  describe('isYin', () => {
    describe('천간', () => {
      const yinStems: HeavenlyStem[] = ['을', '정', '기', '신', '계'];
      const yangStems: HeavenlyStem[] = ['갑', '병', '무', '경', '임'];

      it.each(yinStems)('%s은 음이다', (stem) => {
        expect(isYin(stem)).toBe(true);
      });

      it.each(yangStems)('%s은 음이 아니다', (stem) => {
        expect(isYin(stem)).toBe(false);
      });
    });

    describe('지지', () => {
      const yinBranches: EarthlyBranch[] = ['축', '묘', '사', '미', '유', '해'];
      const yangBranches: EarthlyBranch[] = ['자', '인', '진', '오', '술'];

      it.each(yinBranches)('%s은 음이다', (branch) => {
        expect(isYin(branch)).toBe(true);
      });

      it.each(yangBranches)('%s은 음이 아니다', (branch) => {
        expect(isYin(branch)).toBe(false);
      });
    });
  });

  describe('getOpposite', () => {
    it('양의 반대는 음이다', () => {
      expect(getOpposite('양')).toBe('음');
    });

    it('음의 반대는 양이다', () => {
      expect(getOpposite('음')).toBe('양');
    });
  });
});
