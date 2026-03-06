import { describe, it, expect } from 'vitest';
import { LimitExceededPartial } from '@/views/limit-exceeded.js';

function render() {
  const element = LimitExceededPartial();
  return (element as unknown as { toString(): string }).toString();
}

describe('LimitExceededPartial', () => {
  it('무료 횟수 소진 안내가 표시된다', () => {
    const html = render();
    expect(html).toContain('무료 횟수를 모두 사용했습니다');
  });

  it('구독 플랜 링크가 있다', () => {
    const html = render();
    expect(html).toContain('href="/subscribe"');
    expect(html).toContain('구독 플랜 보기');
  });

  it('초기화 안내가 표시된다', () => {
    const html = render();
    expect(html).toContain('초기화');
  });
});
