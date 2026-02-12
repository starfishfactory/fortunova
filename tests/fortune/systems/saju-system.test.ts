import { describe, it, expect } from 'vitest';
import { sajuSystem } from '@/fortune/systems/saju-system.js';
import type { FortuneCategory } from '@/fortune/types.js';

describe('saju-system (FortuneSystem 구현체)', () => {
  describe('메타데이터', () => {
    it('id가 "saju"이다', () => {
      expect(sajuSystem.id).toBe('saju');
    });

    it('name이 "사주/명리"이다', () => {
      expect(sajuSystem.name).toBe('사주/명리');
    });

    it('필수 입력 필드를 정의한다', () => {
      expect(sajuSystem.requiredInput.length).toBeGreaterThan(0);

      const fieldNames = sajuSystem.requiredInput.map((f) => f.name);
      expect(fieldNames).toContain('birthDate');
      expect(fieldNames).toContain('birthTime');
      expect(fieldNames).toContain('gender');
    });
  });

  describe('analyze', () => {
    it('사주 분석 결과를 반환한다', async () => {
      const input = {
        year: 1990,
        month: 5,
        day: 15,
        hour: 14,
        isLunar: false,
        isLeapMonth: false,
        gender: 'M',
      };

      const result = await sajuSystem.analyze(input);

      expect(result.systemId).toBe('saju');
      expect(result.data).toHaveProperty('fourPillars');
      expect(result.data).toHaveProperty('tenGods');
      expect(result.data).toHaveProperty('elementBalance');
      expect(result.data).toHaveProperty('dayMasterStrength');
      expect(result.data).toHaveProperty('majorFate');
    });

    it('사주팔자가 정확하게 계산된다', async () => {
      // general-001 케이스
      const input = {
        year: 1990,
        month: 5,
        day: 15,
        hour: 14,
        isLunar: false,
        isLeapMonth: false,
        gender: 'M',
      };

      const result = await sajuSystem.analyze(input);
      const fourPillars = result.data.fourPillars as {
        year: { stem: string; branch: string };
        month: { stem: string; branch: string };
        day: { stem: string; branch: string };
        hour: { stem: string; branch: string };
      };

      expect(fourPillars.year).toEqual({ stem: '경', branch: '오' });
      expect(fourPillars.month).toEqual({ stem: '신', branch: '사' });
      expect(fourPillars.day).toEqual({ stem: '경', branch: '진' });
      expect(fourPillars.hour).toEqual({ stem: '계', branch: '미' });
    });

    it('대운이 8개 생성된다', async () => {
      const input = {
        year: 1990,
        month: 5,
        day: 15,
        hour: 14,
        isLunar: false,
        isLeapMonth: false,
        gender: 'M',
      };

      const result = await sajuSystem.analyze(input);
      const majorFate = result.data.majorFate as unknown[];

      expect(majorFate).toHaveLength(8);
    });
  });

  describe('buildPrompt', () => {
    it('카테고리별 LLM 프롬프트를 생성한다', async () => {
      const input = {
        year: 1990,
        month: 5,
        day: 15,
        hour: 14,
        isLunar: false,
        isLeapMonth: false,
        gender: 'M',
      };

      const analysis = await sajuSystem.analyze(input);
      const categories: FortuneCategory[] = ['daily', 'love', 'career', 'health', 'wealth'];

      for (const category of categories) {
        const prompt = sajuSystem.buildPrompt(analysis, category);
        expect(prompt).toContain('사주');
        expect(typeof prompt).toBe('string');
        expect(prompt.length).toBeGreaterThan(50);
      }
    });

    it('프롬프트에 사주팔자 정보가 포함된다', async () => {
      const input = {
        year: 1990,
        month: 5,
        day: 15,
        hour: 14,
        isLunar: false,
        isLeapMonth: false,
        gender: 'M',
      };

      const analysis = await sajuSystem.analyze(input);
      const prompt = sajuSystem.buildPrompt(analysis, 'daily');

      expect(prompt).toContain('경');
      expect(prompt).toContain('일간');
    });
  });

  describe('parseResult', () => {
    it('LLM 응답을 FortuneResult로 파싱한다', () => {
      const llmResponse = JSON.stringify({
        summary: '오늘은 좋은 날입니다',
        detail: '금의 기운이 강하여...',
        score: 85,
        advice: '서쪽 방향이 좋습니다',
        luckyColor: '흰색',
        luckyNumber: 7,
      });

      const result = sajuSystem.parseResult(llmResponse);

      expect(result.summary).toBe('오늘은 좋은 날입니다');
      expect(result.detail).toBe('금의 기운이 강하여...');
      expect(result.score).toBe(85);
      expect(result.advice).toBe('서쪽 방향이 좋습니다');
      expect(result.luckyColor).toBe('흰색');
      expect(result.luckyNumber).toBe(7);
    });

    it('파싱 실패 시 기본값을 반환한다', () => {
      const result = sajuSystem.parseResult('invalid json');

      expect(result.summary).toBeTruthy();
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });
  });
});
