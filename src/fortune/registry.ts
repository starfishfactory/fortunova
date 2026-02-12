import type { FortuneSystem } from './types.js';

/**
 * FortuneSystem 레지스트리 (FR-007)
 *
 * FortuneSystem 인터페이스를 구현한 운세 체계를 등록/조회한다.
 */
export class FortuneSystemRegistry {
  private systems = new Map<string, FortuneSystem>();

  register(system: FortuneSystem): void {
    if (this.systems.has(system.id)) {
      throw new Error(`FortuneSystem '${system.id}' is already registered`);
    }
    this.systems.set(system.id, system);
  }

  get(id: string): FortuneSystem | undefined {
    return this.systems.get(id);
  }

  getAll(): FortuneSystem[] {
    return Array.from(this.systems.values());
  }

  has(id: string): boolean {
    return this.systems.has(id);
  }
}
