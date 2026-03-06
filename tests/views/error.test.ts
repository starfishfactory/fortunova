import { describe, it, expect } from 'vitest';
import { ErrorPartial } from '@/views/error.js';

function render(code: string, message: string) {
  const element = ErrorPartial({ code, message });
  return (element as unknown as { toString(): string }).toString();
}

describe('ErrorPartial', () => {
  it('에러 코드가 표시된다', () => {
    const html = render('VALIDATION_ERROR', '입력값이 올바르지 않습니다');
    expect(html).toContain('VALIDATION_ERROR');
  });

  it('에러 메시지가 표시된다', () => {
    const html = render('VALIDATION_ERROR', '입력값이 올바르지 않습니다');
    expect(html).toContain('입력값이 올바르지 않습니다');
  });

  it('오류 라벨이 표시된다', () => {
    const html = render('VALIDATION_ERROR', '입력값이 올바르지 않습니다');
    expect(html).toContain('오류');
  });
});
