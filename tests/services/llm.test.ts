import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { ChildProcess } from 'child_process';

type ExecFileCallback = (error: NodeJS.ErrnoException | null, stdout: string, stderr: string) => void;

// child_process mock
vi.mock('child_process', () => ({
  execFile: vi.fn(),
}));

// config mock
vi.mock('@/config.js', () => ({
  config: {
    claudeMode: 'local' as const,
    claudeContainer: 'claude-api',
    claudeTimeout: 60000,
  },
}));

import { execFile } from 'child_process';
import { config } from '@/config.js';

const mockExecFile = vi.mocked(execFile);
const mockConfig = config as { claudeMode: 'local' | 'docker'; claudeContainer: string; claudeTimeout: number };

describe('callClaude', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConfig.claudeMode = 'local';
    mockConfig.claudeContainer = 'claude-api';
    mockConfig.claudeTimeout = 60000;
  });

  afterEach(async () => {
    const { _resetSemaphore } = await import('@/services/llm.js');
    _resetSemaphore();
  });

  describe('local 모드', () => {
    it('정상적으로 Claude CLI 응답을 반환한다', async () => {
      mockExecFile.mockImplementation((_cmd, _args, _opts, callback) => {
        (callback as ExecFileCallback)(null, '운세 결과입니다', '');
        return {} as ChildProcess;
      });

      const { callClaude } = await import('@/services/llm.js');
      const result = await callClaude('테스트 프롬프트');

      expect(result).toBe('운세 결과입니다');
      expect(mockExecFile).toHaveBeenCalledWith(
        'sh',
        expect.arrayContaining(['-c']),
        expect.objectContaining({ timeout: expect.any(Number), maxBuffer: 10 * 1024 * 1024 }),
        expect.any(Function),
      );
      const callArgs = mockExecFile.mock.calls[0];
      expect((callArgs[2] as { timeout: number }).timeout).toBeGreaterThanOrEqual(120000);
    });

    it('타임아웃 시 에러를 던진다', async () => {
      mockExecFile.mockImplementation((_cmd, _args, _opts, callback) => {
        const error: NodeJS.ErrnoException & { killed?: boolean } = new Error('Command timed out');
        error.killed = true;
        (callback as ExecFileCallback)(error, '', '');
        return {} as ChildProcess;
      });

      const { callClaude } = await import('@/services/llm.js');
      await expect(callClaude('테스트')).rejects.toThrow('Claude CLI 타임아웃');
    });

    it('프로세스 에러 시 에러를 던진다', async () => {
      mockExecFile.mockImplementation((_cmd, _args, _opts, callback) => {
        const error: NodeJS.ErrnoException = new Error('Command failed');
        error.code = '1';
        (callback as ExecFileCallback)(error, '', 'some error');
        return {} as ChildProcess;
      });

      const { callClaude } = await import('@/services/llm.js');
      await expect(callClaude('테스트')).rejects.toThrow('Claude CLI 에러');
    });

    it('빈 응답 시 에러를 던진다', async () => {
      mockExecFile.mockImplementation((_cmd, _args, _opts, callback) => {
        (callback as ExecFileCallback)(null, '', '');
        return {} as ChildProcess;
      });

      const { callClaude } = await import('@/services/llm.js');
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

      const { callClaude } = await import('@/services/llm.js');
      const promise1 = callClaude('첫 번째');
      const promise2 = callClaude('두 번째');

      await vi.waitFor(() => {
        expect(callOrder).toContain('first-start');
      });
      expect(callOrder).not.toContain('second-start');

      resolveFirst!();
      await promise1;

      await vi.waitFor(() => {
        expect(callOrder).toContain('second-start');
      });

      resolveSecond!();
      const result2 = await promise2;

      expect(result2).toBe('두 번째 결과');
      expect(callOrder).toEqual(['first-start', 'first-done', 'second-start', 'second-done']);
    });
  });

  describe('docker 모드', () => {
    beforeEach(() => {
      mockConfig.claudeMode = 'docker';
    });

    it('docker exec으로 Claude를 호출한다', async () => {
      mockExecFile.mockImplementation((_cmd, _args, _opts, callback) => {
        (callback as ExecFileCallback)(null, '도커 운세 결과', '');
        return {} as ChildProcess;
      });

      const { callClaude } = await import('@/services/llm.js');
      const result = await callClaude('테스트 프롬프트');

      expect(result).toBe('도커 운세 결과');
      expect(mockExecFile).toHaveBeenCalledWith(
        'docker',
        ['exec', 'claude-api', 'sh', '-c', expect.stringContaining('claude')],
        expect.objectContaining({ timeout: expect.any(Number), maxBuffer: 10 * 1024 * 1024 }),
        expect.any(Function),
      );
      const callArgs = mockExecFile.mock.calls[0];
      expect((callArgs[2] as { timeout: number }).timeout).toBeGreaterThanOrEqual(120000);
    });

    it('커스텀 컨테이너 이름을 사용한다', async () => {
      mockConfig.claudeContainer = 'my-claude';

      mockExecFile.mockImplementation((_cmd, _args, _opts, callback) => {
        (callback as ExecFileCallback)(null, '결과', '');
        return {} as ChildProcess;
      });

      const { callClaude } = await import('@/services/llm.js');
      await callClaude('테스트');

      expect(mockExecFile).toHaveBeenCalledWith(
        'docker',
        ['exec', 'my-claude', 'sh', '-c', expect.stringContaining('claude')],
        expect.objectContaining({ timeout: expect.any(Number), maxBuffer: 10 * 1024 * 1024 }),
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

      const { callClaude } = await import('@/services/llm.js');
      await expect(callClaude('테스트')).rejects.toThrow('Claude CLI 타임아웃');
    });
  });
});
