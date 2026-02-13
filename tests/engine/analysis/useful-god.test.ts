import { describe, it, expect } from 'vitest';
import type { FiveElement, FourPillars } from '@/engine/types/index.js';
import { determineUsefulGod } from '@/engine/analysis/useful-god.js';

function makePillars(dayStem: string): FourPillars {
  return {
    year: { stem: '갑' as any, branch: '자' as any },
    month: { stem: '병' as any, branch: '인' as any },
    day: { stem: dayStem as any, branch: '오' as any },
    hour: { stem: '경' as any, branch: '신' as any },
  };
}

describe('determineUsefulGod', () => {
  it('신강(strong)하면 설기하는 오행 중 부족한 것을 용신으로 취한다', () => {
    const pillars = makePillars('갑'); // 갑 = 목
    const balance: Record<FiveElement, number> = {
      '목': 0.375, '화': 0.25, '토': 0.125, '금': 0.125, '수': 0.125,
    };

    const result = determineUsefulGod(pillars, balance, 'strong');

    // 목이 신강 → 설기 필요 (식상=화, 재성=토, 관성=금)
    // 토/금이 가장 부족하므로 둘 중 하나
    expect(['토', '금']).toContain(result);
  });

  it('신약(weak)하면 보강하는 오행 중 부족한 것을 용신으로 취한다', () => {
    const pillars = makePillars('갑'); // 갑 = 목
    const balance: Record<FiveElement, number> = {
      '목': 0.125, '화': 0.125, '토': 0.25, '금': 0.25, '수': 0.25,
    };

    const result = determineUsefulGod(pillars, balance, 'weak');

    // 목이 신약 → 보강 필요 (비겁=목, 인성=수)
    // 목이 더 부족하므로 목
    expect(result).toBe('목');
  });

  it('신약 시 인성이 더 부족하면 인성 오행을 용신으로 취한다', () => {
    const pillars = makePillars('병'); // 병 = 화
    const balance: Record<FiveElement, number> = {
      '목': 0.0, '화': 0.25, '토': 0.25, '금': 0.25, '수': 0.25,
    };

    const result = determineUsefulGod(pillars, balance, 'weak');

    // 화가 신약 → 보강 필요 (비겁=화, 인성=목)
    // 목이 0으로 더 부족
    expect(result).toBe('목');
  });

  it('중립(neutral)이면 가장 부족한 오행을 용신으로 취한다', () => {
    const pillars = makePillars('무'); // 무 = 토
    const balance: Record<FiveElement, number> = {
      '목': 0.25, '화': 0.25, '토': 0.25, '금': 0.125, '수': 0.125,
    };

    const result = determineUsefulGod(pillars, balance, 'neutral');

    // 금/수가 가장 부족
    expect(['금', '수']).toContain(result);
  });

  it('반환값은 항상 유효한 오행이다', () => {
    const validElements: FiveElement[] = ['목', '화', '토', '금', '수'];
    const pillars = makePillars('임'); // 임 = 수
    const balance: Record<FiveElement, number> = {
      '목': 0.2, '화': 0.2, '토': 0.2, '금': 0.2, '수': 0.2,
    };

    for (const strength of ['strong', 'weak', 'neutral'] as const) {
      const result = determineUsefulGod(pillars, balance, strength);
      expect(validElements).toContain(result);
    }
  });

  it('경금(경=금) 신강 시 용신을 올바르게 결정한다', () => {
    const pillars = makePillars('경'); // 경 = 금
    const balance: Record<FiveElement, number> = {
      '목': 0.0, '화': 0.125, '토': 0.375, '금': 0.375, '수': 0.125,
    };

    const result = determineUsefulGod(pillars, balance, 'strong');

    // 금이 신강 → 식상=수, 재성=목, 관성=화
    // 목이 0으로 가장 부족
    expect(result).toBe('목');
  });
});
