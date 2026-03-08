import { describe, it, expect } from 'vitest';
import { analyzeSinsal } from '@/engine/analysis/sinsal.js';
import type { FourPillars, SinsalResult } from '@/engine/types/index.js';

/** 헬퍼: 결과에서 특정 신살 이름으로 필터 */
function findByName(results: SinsalResult[], name: string): SinsalResult[] {
  return results.filter((r) => r.name === name);
}

describe('sinsal (신살 분석)', () => {
  // ─── 도화살(桃花殺) ───
  describe('도화살', () => {
    it('일지 오(인오술 삼합) → 묘가 년지에 있으면 도화살을 반환한다', () => {
      const pillars: FourPillars = {
        year: { stem: '갑', branch: '묘' },
        month: { stem: '병', branch: '인' },
        day: { stem: '경', branch: '오' },
        hour: { stem: '무', branch: '신' },
      };
      const results = analyzeSinsal(pillars);
      const dohwa = findByName(results, '도화살');
      expect(dohwa.length).toBeGreaterThanOrEqual(1);
      expect(dohwa.some((r) => r.position === '년지')).toBe(true);
    });

    it('일지 자(신자진 삼합) → 유가 시지에 있으면 도화살을 반환한다', () => {
      const pillars: FourPillars = {
        year: { stem: '임', branch: '인' },
        month: { stem: '갑', branch: '축' },
        day: { stem: '갑', branch: '자' },
        hour: { stem: '을', branch: '유' },
      };
      const results = analyzeSinsal(pillars);
      const dohwa = findByName(results, '도화살');
      expect(dohwa.length).toBeGreaterThanOrEqual(1);
      expect(dohwa.some((r) => r.position === '시지')).toBe(true);
    });

    it('도화 지지가 없으면 도화살이 없다', () => {
      const pillars: FourPillars = {
        year: { stem: '갑', branch: '인' },
        month: { stem: '병', branch: '술' },
        day: { stem: '경', branch: '오' },
        hour: { stem: '무', branch: '신' },
      };
      const results = analyzeSinsal(pillars);
      const dohwa = findByName(results, '도화살');
      expect(dohwa).toHaveLength(0);
    });
  });

  // ─── 역마살(驛馬殺) ───
  describe('역마살', () => {
    it('일지 오(인오술) → 신이 시지에 있으면 역마살을 반환한다', () => {
      const pillars: FourPillars = {
        year: { stem: '갑', branch: '묘' },
        month: { stem: '병', branch: '인' },
        day: { stem: '경', branch: '오' },
        hour: { stem: '무', branch: '신' },
      };
      const results = analyzeSinsal(pillars);
      const yeokma = findByName(results, '역마살');
      expect(yeokma.length).toBeGreaterThanOrEqual(1);
      expect(yeokma.some((r) => r.position === '시지')).toBe(true);
    });

    it('일지 축(사유축) → 해가 년지에 있으면 역마살을 반환한다', () => {
      const pillars: FourPillars = {
        year: { stem: '계', branch: '해' },
        month: { stem: '갑', branch: '인' },
        day: { stem: '기', branch: '축' },
        hour: { stem: '무', branch: '진' },
      };
      const results = analyzeSinsal(pillars);
      const yeokma = findByName(results, '역마살');
      expect(yeokma.length).toBeGreaterThanOrEqual(1);
      expect(yeokma.some((r) => r.position === '년지')).toBe(true);
    });

    it('역마 지지가 없으면 역마살이 없다', () => {
      const pillars: FourPillars = {
        year: { stem: '갑', branch: '묘' },
        month: { stem: '병', branch: '인' },
        day: { stem: '경', branch: '오' },
        hour: { stem: '무', branch: '진' },
      };
      const results = analyzeSinsal(pillars);
      const yeokma = findByName(results, '역마살');
      expect(yeokma).toHaveLength(0);
    });
  });

  // ─── 천을귀인(天乙貴人) ───
  describe('천을귀인', () => {
    it('일간 갑(갑/무 → 축,미) → 축이 월지에 있으면 천을귀인을 반환한다', () => {
      const pillars: FourPillars = {
        year: { stem: '임', branch: '인' },
        month: { stem: '갑', branch: '축' },
        day: { stem: '갑', branch: '오' },
        hour: { stem: '을', branch: '사' },
      };
      const results = analyzeSinsal(pillars);
      const gwiin = findByName(results, '천을귀인');
      expect(gwiin.length).toBeGreaterThanOrEqual(1);
      expect(gwiin.some((r) => r.position === '월지')).toBe(true);
    });

    it('일간 병(병/정 → 해,유) → 해가 년지에 있으면 천을귀인을 반환한다', () => {
      const pillars: FourPillars = {
        year: { stem: '계', branch: '해' },
        month: { stem: '갑', branch: '인' },
        day: { stem: '병', branch: '술' },
        hour: { stem: '무', branch: '진' },
      };
      const results = analyzeSinsal(pillars);
      const gwiin = findByName(results, '천을귀인');
      expect(gwiin.length).toBeGreaterThanOrEqual(1);
      expect(gwiin.some((r) => r.position === '년지')).toBe(true);
    });

    it('귀인 지지가 없으면 천을귀인이 없다', () => {
      const pillars: FourPillars = {
        year: { stem: '임', branch: '인' },
        month: { stem: '갑', branch: '묘' },
        day: { stem: '갑', branch: '오' },
        hour: { stem: '을', branch: '사' },
      };
      const results = analyzeSinsal(pillars);
      const gwiin = findByName(results, '천을귀인');
      expect(gwiin).toHaveLength(0);
    });
  });

  // ─── 화개살(華蓋殺) ───
  describe('화개살', () => {
    it('일지 오(인오술) → 술이 월지에 있으면 화개살을 반환한다', () => {
      const pillars: FourPillars = {
        year: { stem: '갑', branch: '묘' },
        month: { stem: '병', branch: '술' },
        day: { stem: '경', branch: '오' },
        hour: { stem: '무', branch: '신' },
      };
      const results = analyzeSinsal(pillars);
      const hwagae = findByName(results, '화개살');
      expect(hwagae.length).toBeGreaterThanOrEqual(1);
      expect(hwagae.some((r) => r.position === '월지')).toBe(true);
    });

    it('화개 지지가 없으면 화개살이 없다', () => {
      const pillars: FourPillars = {
        year: { stem: '갑', branch: '묘' },
        month: { stem: '병', branch: '인' },
        day: { stem: '경', branch: '오' },
        hour: { stem: '무', branch: '신' },
      };
      const results = analyzeSinsal(pillars);
      const hwagae = findByName(results, '화개살');
      expect(hwagae).toHaveLength(0);
    });
  });

  // ─── 양인살(羊刃殺) ───
  describe('양인살', () => {
    it('일간 갑 → 묘가 년지에 있으면 양인살을 반환한다', () => {
      const pillars: FourPillars = {
        year: { stem: '갑', branch: '묘' },
        month: { stem: '병', branch: '인' },
        day: { stem: '갑', branch: '오' },
        hour: { stem: '무', branch: '신' },
      };
      const results = analyzeSinsal(pillars);
      const yangin = findByName(results, '양인살');
      expect(yangin.length).toBeGreaterThanOrEqual(1);
      expect(yangin.some((r) => r.position === '년지')).toBe(true);
    });

    it('일간 임 → 자가 시지에 있으면 양인살을 반환한다', () => {
      const pillars: FourPillars = {
        year: { stem: '갑', branch: '인' },
        month: { stem: '병', branch: '술' },
        day: { stem: '임', branch: '오' },
        hour: { stem: '경', branch: '자' },
      };
      const results = analyzeSinsal(pillars);
      const yangin = findByName(results, '양인살');
      expect(yangin.length).toBeGreaterThanOrEqual(1);
      expect(yangin.some((r) => r.position === '시지')).toBe(true);
    });

    it('일간 을(음간)은 양인살이 없다', () => {
      const pillars: FourPillars = {
        year: { stem: '갑', branch: '묘' },
        month: { stem: '병', branch: '인' },
        day: { stem: '을', branch: '해' },
        hour: { stem: '무', branch: '유' },
      };
      const results = analyzeSinsal(pillars);
      const yangin = findByName(results, '양인살');
      expect(yangin).toHaveLength(0);
    });

    it('양인 지지가 없으면 양인살이 없다', () => {
      const pillars: FourPillars = {
        year: { stem: '갑', branch: '인' },
        month: { stem: '병', branch: '술' },
        day: { stem: '갑', branch: '오' },
        hour: { stem: '무', branch: '신' },
      };
      const results = analyzeSinsal(pillars);
      const yangin = findByName(results, '양인살');
      expect(yangin).toHaveLength(0);
    });
  });

  // ─── 공망(空亡) ───
  describe('공망', () => {
    it('일주 갑자(갑자순, 공망=술,해) → 해가 년지에 있으면 공망을 반환한다', () => {
      const pillars: FourPillars = {
        year: { stem: '계', branch: '해' },
        month: { stem: '갑', branch: '인' },
        day: { stem: '갑', branch: '자' },
        hour: { stem: '을', branch: '유' },
      };
      const results = analyzeSinsal(pillars);
      const gongmang = findByName(results, '공망');
      expect(gongmang.length).toBeGreaterThanOrEqual(1);
      expect(gongmang.some((r) => r.position === '년지')).toBe(true);
    });

    it('일주 갑술(갑술순, 공망=신,유) → 유가 시지에 있으면 공망을 반환한다', () => {
      const pillars: FourPillars = {
        year: { stem: '갑', branch: '인' },
        month: { stem: '병', branch: '묘' },
        day: { stem: '갑', branch: '술' },
        hour: { stem: '을', branch: '유' },
      };
      const results = analyzeSinsal(pillars);
      const gongmang = findByName(results, '공망');
      expect(gongmang.length).toBeGreaterThanOrEqual(1);
      expect(gongmang.some((r) => r.position === '시지')).toBe(true);
    });

    it('공망 지지가 없으면 공망이 없다', () => {
      const pillars: FourPillars = {
        year: { stem: '갑', branch: '인' },
        month: { stem: '병', branch: '묘' },
        day: { stem: '갑', branch: '자' },
        hour: { stem: '을', branch: '사' },
      };
      const results = analyzeSinsal(pillars);
      const gongmang = findByName(results, '공망');
      expect(gongmang).toHaveLength(0);
    });
  });

  // ─── 복합 케이스 ───
  describe('복합 케이스', () => {
    it('여러 신살이 동시에 존재하는 사주를 올바르게 분석한다', () => {
      // 일간 갑, 일지 오(인오술 삼합)
      // 도화살: 묘 → 년지에 묘
      // 역마살: 신 → 시지에 신
      // 양인살: 갑→묘 → 년지에 묘
      // 화개살: 술 → 월지에 술
      // 천을귀인: 갑→축,미 → 미가 시지... 아닌데 시지=신
      const pillars: FourPillars = {
        year: { stem: '갑', branch: '묘' },
        month: { stem: '병', branch: '술' },
        day: { stem: '갑', branch: '오' },
        hour: { stem: '무', branch: '신' },
      };
      const results = analyzeSinsal(pillars);

      const names = results.map((r) => r.name);
      expect(names).toContain('도화살');
      expect(names).toContain('역마살');
      expect(names).toContain('양인살');
      expect(names).toContain('화개살');
    });

    it('description 필드에 의미 설명이 포함된다', () => {
      const pillars: FourPillars = {
        year: { stem: '갑', branch: '묘' },
        month: { stem: '병', branch: '인' },
        day: { stem: '경', branch: '오' },
        hour: { stem: '무', branch: '신' },
      };
      const results = analyzeSinsal(pillars);
      for (const r of results) {
        expect(r.description).toBeTruthy();
        expect(typeof r.description).toBe('string');
        expect(r.description.length).toBeGreaterThan(0);
      }
    });
  });
});
