import { describe, it, expect } from 'vitest';
import { FortuneResultPartial } from '@/views/fortune-result.js';
import type { FortuneResult } from '@/fortune/types.js';

function render(fortune: FortuneResult, opts?: { cached?: boolean; remainingFreeCount?: number }) {
  const element = FortuneResultPartial({
    fortune,
    sajuSummary: { fourPillars: '경오 신사 경진 계미' },
    cached: opts?.cached ?? false,
    remainingFreeCount: opts?.remainingFreeCount ?? 3,
  });
  return (element as unknown as { toString(): string }).toString();
}

function baseFortune(overrides?: Partial<FortuneResult>): FortuneResult {
  return {
    summary: '오늘은 좋은 날입니다',
    detail: '금의 기운이 강하여 좋은 일이 있을 것입니다.',
    score: 85,
    advice: '서쪽 방향이 좋습니다',
    ...overrides,
  };
}

describe('FortuneResultPartial', () => {
  it('종합 점수가 표시된다', () => {
    const html = render(baseFortune({ score: 85 }));
    expect(html).toContain('85');
  });

  it('요약이 표시된다', () => {
    const html = render(baseFortune({ summary: '오늘은 좋은 날입니다' }));
    expect(html).toContain('오늘은 좋은 날입니다');
  });

  it('상세 설명이 표시된다', () => {
    const html = render(baseFortune({ detail: '금의 기운이 강하여 좋은 일이 있을 것입니다.' }));
    expect(html).toContain('금의 기운이 강하여 좋은 일이 있을 것입니다.');
  });

  it('조언이 표시된다', () => {
    const html = render(baseFortune({ advice: '서쪽 방향이 좋습니다' }));
    expect(html).toContain('서쪽 방향이 좋습니다');
  });

  it('점수별 색상이 올바르다 (score >= 80)', () => {
    const html = render(baseFortune({ score: 85 }));
    expect(html).toContain('#e8c170');
  });

  it('점수별 색상이 올바르다 (score 60~79)', () => {
    const html = render(baseFortune({ score: 70 }));
    expect(html).toContain('#d4a853');
  });

  it('점수별 색상이 올바르다 (score 40~59)', () => {
    const html = render(baseFortune({ score: 50 }));
    expect(html).toContain('#b8923d');
  });

  it('점수별 색상이 올바르다 (score < 40)', () => {
    const html = render(baseFortune({ score: 30 }));
    expect(html).toContain('#8b6914');
  });

  it('오행 흐름이 있을 때 표시된다', () => {
    const html = render(baseFortune({ elementInsight: '목의 기운이 강합니다' }));
    expect(html).toContain('목의 기운이 강합니다');
    expect(html).toContain('오행 흐름');
  });

  it('오행 흐름이 없을 때 숨겨진다', () => {
    const html = render(baseFortune({ elementInsight: undefined }));
    expect(html).not.toContain('오행 흐름');
  });

  it('세부운세가 있을 때 4개 항목이 표시된다', () => {
    const html = render(baseFortune({
      subFortunes: {
        wealth: { score: 80, description: '재물운 좋음' },
        health: { score: 70, description: '건강운 보통' },
        love: { score: 90, description: '연애운 최고' },
        career: { score: 60, description: '직장운 무난' },
      },
    }));
    expect(html).toContain('재물운');
    expect(html).toContain('건강운');
    expect(html).toContain('연애운');
    expect(html).toContain('직장운');
  });

  it('행운 정보가 있을 때 색/숫자/방위/시간이 표시된다', () => {
    const html = render(baseFortune({
      lucky: { color: '파란색', number: 7, direction: '동쪽', timeSlot: '오전 10시' },
    }));
    expect(html).toContain('파란색');
    expect(html).toContain('7');
    expect(html).toContain('동쪽');
    expect(html).toContain('오전 10시');
  });

  it('월간 트렌드가 있을 때 표시된다', () => {
    const html = render(baseFortune({
      monthlyTrend: [
        { month: '2026-03', trend: '상승세', rating: 4 },
        { month: '2026-04', trend: '안정적', rating: 3 },
        { month: '2026-05', trend: '주의 필요', rating: 2 },
      ],
    }));
    expect(html).toContain('2026-03');
    expect(html).toContain('상승세');
    expect(html).toContain('3개월 운세 흐름');
  });

  it('캐시된 결과일 때 안내가 표시된다', () => {
    const html = render(baseFortune(), { cached: true });
    expect(html).toContain('캐시된 결과');
  });

  it('남은 무료 횟수가 표시된다', () => {
    const html = render(baseFortune(), { remainingFreeCount: 2 });
    expect(html).toContain('2');
    expect(html).toContain('무료 횟수');
  });
});
