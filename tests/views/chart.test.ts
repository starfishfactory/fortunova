import { describe, it, expect } from 'vitest';
import { ChartPartial } from '@/views/chart.js';

describe('ChartPartial', () => {
  it('대운과 세운 데이터를 렌더링한다', () => {
    const majorFate = [
      { startAge: 1, endAge: 11, ganJi: { stem: '갑' as const, branch: '자' as const } },
      { startAge: 11, endAge: 21, ganJi: { stem: '을' as const, branch: '축' as const } },
    ];
    const yearlyFate = [
      { year: 2025, ganJi: { stem: '을' as const, branch: '사' as const } },
      { year: 2026, ganJi: { stem: '병' as const, branch: '오' as const } },
    ];

    const result = ChartPartial({ majorFate, yearlyFate, currentAge: 5 });

    // JSX 반환값이 존재하는지 확인
    expect(result).toBeTruthy();
  });
});
