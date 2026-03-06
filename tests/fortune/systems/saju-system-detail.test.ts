import { describe, it, expect } from 'vitest';
import { sajuSystem } from '@/fortune/systems/saju-system.js';
import type { FortuneCategory } from '@/fortune/types.js';

const testInput = {
  year: 1990,
  month: 5,
  day: 15,
  hour: 14,
  isLunar: false,
  isLeapMonth: false,
  gender: 'M',
};

describe('saju-system buildPrompt 상세', () => {
  it('프롬프트에 사주 정보가 포함된다', async () => {
    const analysis = await sajuSystem.analyze(testInput);
    const prompt = sajuSystem.buildPrompt(analysis, 'daily');

    expect(prompt).toContain('사주팔자');
    expect(prompt).toContain('년주');
    expect(prompt).toContain('월주');
    expect(prompt).toContain('일주');
    expect(prompt).toContain('시주');
  });

  it('프롬프트에 카테고리 레이블이 포함된다', async () => {
    const analysis = await sajuSystem.analyze(testInput);
    const labels: Record<FortuneCategory, string> = {
      daily: '오늘의 운세',
      love: '애정운',
      career: '직장/사업운',
      health: '건강운',
      wealth: '재물운',
    };

    for (const [cat, label] of Object.entries(labels)) {
      const prompt = sajuSystem.buildPrompt(analysis, cat as FortuneCategory);
      expect(prompt).toContain(label);
    }
  });

  it('프롬프트에 나이와 생애 단계가 포함된다', async () => {
    const analysis = await sajuSystem.analyze(testInput);
    const prompt = sajuSystem.buildPrompt(analysis, 'daily');

    expect(prompt).toContain('만 나이');
    expect(prompt).toContain('생애 단계');
  });

  it('생애 단계가 나이에 따라 올바르게 설정된다', async () => {
    const ages = [
      { year: 2015, expected: '학업과 진로 탐색기' },          // < 20
      { year: 2002, expected: '사회 초년생' },                  // 20-27
      { year: 1995, expected: '커리어 성장기' },                // 28-34
      { year: 1985, expected: '사회적 안정기' },                // 35-44
      { year: 1975, expected: '중년 전환기' },                  // 45-54
      { year: 1965, expected: '인생 후반 설계기' },             // 55-64
      { year: 1950, expected: '노년기' },                       // 65+
    ];

    for (const { year, expected } of ages) {
      const input = { ...testInput, year };
      const analysis = await sajuSystem.analyze(input);
      const prompt = sajuSystem.buildPrompt(analysis, 'daily');
      expect(prompt).toContain(expected);
    }
  });
});

describe('saju-system parseResult 상세', () => {
  it('마크다운 코드블록 래핑된 JSON을 파싱한다', () => {
    const wrapped = '```json\n{"summary":"테스트","detail":"상세","score":75,"advice":"조언"}\n```';
    const result = sajuSystem.parseResult(wrapped);
    expect(result.summary).toBe('테스트');
    expect(result.score).toBe(75);
  });

  it('모든 선택적 필드가 있는 완전한 JSON을 파싱한다', () => {
    const full = JSON.stringify({
      summary: '완전한 테스트',
      detail: '상세 설명',
      score: 90,
      advice: '조언',
      luckyColor: '빨강',
      luckyNumber: 3,
      elementInsight: '오행 해설',
      dayTip: '오늘의 팁',
      subFortunes: {
        wealth: { score: 80, description: '재물운 좋음' },
        health: { score: 70, description: '건강운 보통' },
        love: { score: 90, description: '연애운 최고' },
        career: { score: 60, description: '직장운 무난' },
      },
      elementExplanation: '오행 균형 해설',
      lucky: { color: '파랑', number: 7, direction: '동쪽', timeSlot: '오전' },
      cautions: '주의사항',
      monthlyTrend: [
        { month: '2026-03', trend: '상승', rating: 4 },
        { month: '2026-04', trend: '안정', rating: 3 },
        { month: '2026-05', trend: '하락', rating: 2 },
      ],
      compatibilityTip: '궁합 팁',
      proverb: '격언',
      majorFateInterpretation: '대운 해석',
    });

    const result = sajuSystem.parseResult(full);
    expect(result.summary).toBe('완전한 테스트');
    expect(result.score).toBe(90);
    expect(result.subFortunes?.wealth.score).toBe(80);
    expect(result.lucky?.color).toBe('파랑');
    expect(result.monthlyTrend).toHaveLength(3);
    expect(result.compatibilityTip).toBe('궁합 팁');
    expect(result.proverb).toBe('격언');
    expect(result.majorFateInterpretation).toBe('대운 해석');
  });

  it('subFortunes 기본값이 적용된다', () => {
    const json = JSON.stringify({
      summary: '테스트',
      detail: '상세',
      score: 50,
      advice: '조언',
      subFortunes: {
        wealth: {},
        health: { score: 70 },
        love: { description: '좋음' },
        career: { score: 60, description: '무난' },
      },
    });

    const result = sajuSystem.parseResult(json);
    expect(result.subFortunes?.wealth.score).toBe(50);
    expect(result.subFortunes?.wealth.description).toBe('');
    expect(result.subFortunes?.health.score).toBe(70);
    expect(result.subFortunes?.health.description).toBe('');
    expect(result.subFortunes?.love.score).toBe(50);
    expect(result.subFortunes?.love.description).toBe('좋음');
    expect(result.subFortunes?.career.score).toBe(60);
    expect(result.subFortunes?.career.description).toBe('무난');
  });

  it('lucky 필드에서 luckyColor 폴백이 동작한다', () => {
    const json = JSON.stringify({
      summary: '테스트',
      detail: '상세',
      score: 50,
      advice: '조언',
      luckyColor: '초록',
      luckyNumber: 5,
      lucky: { direction: '남쪽', timeSlot: '오후' },
    });

    const result = sajuSystem.parseResult(json);
    expect(result.lucky?.color).toBe('초록');
    expect(result.lucky?.number).toBe(5);
    expect(result.lucky?.direction).toBe('남쪽');
  });

  it('monthlyTrend가 3개로 제한된다', () => {
    const json = JSON.stringify({
      summary: '테스트',
      detail: '상세',
      score: 50,
      advice: '조언',
      monthlyTrend: [
        { month: '2026-01', trend: '1', rating: 1 },
        { month: '2026-02', trend: '2', rating: 2 },
        { month: '2026-03', trend: '3', rating: 3 },
        { month: '2026-04', trend: '4', rating: 4 },
        { month: '2026-05', trend: '5', rating: 5 },
      ],
    });

    const result = sajuSystem.parseResult(json);
    expect(result.monthlyTrend).toHaveLength(3);
  });

  it('score가 숫자가 아닐 때 50으로 폴백한다', () => {
    const json = JSON.stringify({
      summary: '테스트',
      detail: '상세',
      score: '높음',
      advice: '조언',
    });

    const result = sajuSystem.parseResult(json);
    expect(result.score).toBe(50);
  });
});
