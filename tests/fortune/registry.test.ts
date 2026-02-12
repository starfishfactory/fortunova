import { describe, it, expect } from 'vitest';
import { FortuneSystemRegistry } from '@/fortune/registry.js';
import type { FortuneSystem, SystemAnalysis, FortuneResult } from '@/fortune/types.js';

function createMockSystem(id: string): FortuneSystem {
  return {
    id,
    name: `Mock ${id}`,
    requiredInput: [],
    analyze: async () => ({ systemId: id, data: {} }) as SystemAnalysis,
    buildPrompt: () => 'mock prompt',
    parseResult: () => ({ summary: '', detail: '', score: 50, advice: '' }) as FortuneResult,
  };
}

describe('FortuneSystemRegistry', () => {
  it('운세 시스템을 등록하고 조회한다', () => {
    const registry = new FortuneSystemRegistry();
    const system = createMockSystem('saju');
    registry.register(system);
    expect(registry.get('saju')).toBe(system);
  });

  it('중복 등록 시 에러를 던진다', () => {
    const registry = new FortuneSystemRegistry();
    registry.register(createMockSystem('saju'));
    expect(() => registry.register(createMockSystem('saju'))).toThrow("FortuneSystem 'saju' is already registered");
  });

  it('등록 여부를 확인한다', () => {
    const registry = new FortuneSystemRegistry();
    expect(registry.has('saju')).toBe(false);
    registry.register(createMockSystem('saju'));
    expect(registry.has('saju')).toBe(true);
  });

  it('등록된 모든 시스템을 반환한다', () => {
    const registry = new FortuneSystemRegistry();
    registry.register(createMockSystem('saju'));
    registry.register(createMockSystem('tarot'));
    expect(registry.getAll()).toHaveLength(2);
  });
});
