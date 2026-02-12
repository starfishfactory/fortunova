import { describe, it, expect } from 'vitest';
import type { HeavenlyStem, EarthlyBranch, FiveElement, GanJi } from '@/engine/types/index.js';

describe('타입 계약 스모크 테스트', () => {
  it('HeavenlyStem 타입이 올바른 천간 값을 허용한다', () => {
    const stem: HeavenlyStem = '갑';
    expect(stem).toBe('갑');
  });

  it('EarthlyBranch 타입이 올바른 지지 값을 허용한다', () => {
    const branch: EarthlyBranch = '자';
    expect(branch).toBe('자');
  });

  it('FiveElement 타입이 올바른 오행 값을 허용한다', () => {
    const element: FiveElement = '목';
    expect(element).toBe('목');
  });

  it('GanJi 인터페이스가 천간+지지 조합을 나타낸다', () => {
    const ganJi: GanJi = { stem: '갑', branch: '자' };
    expect(ganJi.stem).toBe('갑');
    expect(ganJi.branch).toBe('자');
  });
});
