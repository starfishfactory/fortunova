import { describe, it, expect } from 'vitest';
import { buildFortunePrompt } from '@/services/prompt-builder.js';
import type { SajuAnalysis } from '@/engine/types/index.js';
import type { FortuneCategory } from '@/fortune/types.js';

const mockAnalysis: SajuAnalysis = {
  fourPillars: {
    year: { stem: '경', branch: '오' },
    month: { stem: '신', branch: '사' },
    day: { stem: '갑', branch: '자' },
    hour: { stem: '병', branch: '인' },
  },
  tenGods: {
    '경': '편관',
    '신': '정관',
    '병': '식신',
  },
  elementBalance: {
    '목': 25,
    '화': 30,
    '토': 10,
    '금': 20,
    '수': 15,
  },
  dayMasterStrength: 'weak',
  usefulGod: '수',
  majorFate: [
    { startAge: 1, endAge: 10, ganJi: { stem: '임', branch: '오' } },
  ],
};

describe('buildFortunePrompt', () => {
  it('사주 정보가 프롬프트에 포함된다', () => {
    const prompt = buildFortunePrompt(mockAnalysis, 'daily', '2024-01-15');

    expect(prompt).toContain('경오');
    expect(prompt).toContain('신사');
    expect(prompt).toContain('갑자');
    expect(prompt).toContain('병인');
    expect(prompt).toContain('갑');
    expect(prompt).toContain('weak');
    expect(prompt).toContain('목');
    expect(prompt).toContain('화');
    expect(prompt).toContain('토');
    expect(prompt).toContain('금');
    expect(prompt).toContain('수');
  });

  it('JSON 응답 형식 요청이 포함된다', () => {
    const prompt = buildFortunePrompt(mockAnalysis, 'daily', '2024-01-15');

    expect(prompt).toContain('JSON');
    expect(prompt).toContain('summary');
    expect(prompt).toContain('detail');
    expect(prompt).toContain('score');
    expect(prompt).toContain('advice');
    expect(prompt).toContain('luckyColor');
    expect(prompt).toContain('luckyNumber');
  });

  it('날짜가 프롬프트에 포함된다', () => {
    const prompt = buildFortunePrompt(mockAnalysis, 'daily', '2024-01-15');
    expect(prompt).toContain('2024-01-15');
  });

  const categoryTests: Array<{ category: FortuneCategory; keywords: string[] }> = [
    { category: 'daily', keywords: ['종합', '오늘'] },
    { category: 'love', keywords: ['연애', '애정'] },
    { category: 'career', keywords: ['직장', '사업'] },
    { category: 'health', keywords: ['건강'] },
    { category: 'wealth', keywords: ['재물', '금전'] },
  ];

  categoryTests.forEach(({ category, keywords }) => {
    it(`카테고리 '${category}'에 관련 키워드가 포함된다`, () => {
      const prompt = buildFortunePrompt(mockAnalysis, category, '2024-01-15');
      const hasKeyword = keywords.some((kw) => prompt.includes(kw));
      expect(hasKeyword).toBe(true);
    });
  });

  it('일간의 오행이 프롬프트에 포함된다', () => {
    const prompt = buildFortunePrompt(mockAnalysis, 'daily', '2024-01-15');
    expect(prompt).toContain('목');
  });
});
