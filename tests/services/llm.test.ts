import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { ChildProcess } from 'child_process';
import { callClaude, _resetSemaphore } from '@/services/llm.js';

type ExecFileCallback = (error: NodeJS.ErrnoException | null, stdout: string, stderr: string) => void;

// child_process mock
vi.mock('child_process', () => ({
  execFile: vi.fn(),
}));

import { execFile } from 'child_process';

const mockExecFile = vi.mocked(execFile);

describe('callClaude', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    _resetSemaphore();
  });

  afterEach(() => {
    _resetSemaphore();
  });

  it('정상적으로 Claude CLI 응답을 반환한다', async () => {
    mockExecFile.mockImplementation((_cmd, _args, _opts, callback) => {
      (callback as ExecFileCallback)(null, '운세 결과입니다', '');
      return {} as ChildProcess;
    });

    const result = await callClaude('테스트 프롬프트');

    expect(result).toBe('운세 결과입니다');
    expect(mockExecFile).toHaveBeenCalledWith(
      'claude',
      ['--print', '-p', '테스트 프롬프트'],
      expect.objectContaining({ timeout: 30000 }),
      expect.any(Function),
    );
  });

  it('타임아웃 시 에러를 던진다', async () => {
    mockExecFile.mockImplementation((_cmd, _args, _opts, callback) => {
      const error: NodeJS.ErrnoException & { killed?: boolean } = new Error('Command timed out');
      error.killed = true;
      (callback as ExecFileCallback)(error, '', '');
      return {} as ChildProcess;
    });

    await expect(callClaude('테스트')).rejects.toThrow('Claude CLI 타임아웃');
  });

  it('프로세스 에러 시 에러를 던진다', async () => {
    mockExecFile.mockImplementation((_cmd, _args, _opts, callback) => {
      const error: NodeJS.ErrnoException = new Error('Command failed');
      error.code = '1';
      (callback as ExecFileCallback)(error, '', 'some error');
      return {} as ChildProcess;
    });

    await expect(callClaude('테스트')).rejects.toThrow('Claude CLI 에러');
  });

  it('빈 응답 시 에러를 던진다', async () => {
    mockExecFile.mockImplementation((_cmd, _args, _opts, callback) => {
      (callback as ExecFileCallback)(null, '', '');
      return {} as ChildProcess;
    });

    await expect(callClaude('테스트')).rejects.toThrow('Claude CLI 빈 응답');
  });

  it('세마포어가 동시 호출을 1개로 제한한다', async () => {
    let resolveFirst: () => void;
    let resolveSecond: () => void;

    const callOrder: string[] = [];

    mockExecFile
      .mockImplementationOnce((_cmd, _args, _opts, callback) => {
        resolveFirst = () => {
          callOrder.push('first-done');
          (callback as ExecFileCallback)(null, '첫 번째 결과', '');
        };
        callOrder.push('first-start');
        return {} as ChildProcess;
      })
      .mockImplementationOnce((_cmd, _args, _opts, callback) => {
        resolveSecond = () => {
          callOrder.push('second-done');
          (callback as ExecFileCallback)(null, '두 번째 결과', '');
        };
        callOrder.push('second-start');
        return {} as ChildProcess;
      });

    const promise1 = callClaude('첫 번째');
    const promise2 = callClaude('두 번째');

    // 첫 번째 호출만 시작되어야 함
    await vi.waitFor(() => {
      expect(callOrder).toContain('first-start');
    });
    expect(callOrder).not.toContain('second-start');

    // 첫 번째 완료
    resolveFirst!();
    await promise1;

    // 두 번째 호출이 시작되어야 함
    await vi.waitFor(() => {
      expect(callOrder).toContain('second-start');
    });

    resolveSecond!();
    const result2 = await promise2;

    expect(result2).toBe('두 번째 결과');
    expect(callOrder).toEqual(['first-start', 'first-done', 'second-start', 'second-done']);
  });
});
