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

    it('세마포어가 동시 호출을 3개로 제한한다', async () => {
      const resolvers: (() => void)[] = [];
      const callOrder: string[] = [];

      for (let i = 0; i < 4; i++) {
        mockExecFile.mockImplementationOnce((_cmd, _args, _opts, callback) => {
          const idx = i;
          resolvers[idx] = () => {
            callOrder.push(`${idx}-done`);
            (callback as ExecFileCallback)(null, `결과${idx}`, '');
          };
          callOrder.push(`${idx}-start`);
          return {} as ChildProcess;
        });
      }

      const { callClaude } = await import('@/services/llm.js');
      const promises = [0, 1, 2, 3].map((i) => callClaude(`호출${i}`));

      // 3개까지 동시 시작, 4번째는 대기
      await vi.waitFor(() => {
        expect(callOrder).toContain('0-start');
        expect(callOrder).toContain('1-start');
        expect(callOrder).toContain('2-start');
      });
      expect(callOrder).not.toContain('3-start');

      // 하나 완료하면 4번째 시작
      resolvers[0]();
      await promises[0];

      await vi.waitFor(() => {
        expect(callOrder).toContain('3-start');
      });

      resolvers[1]();
      resolvers[2]();
      resolvers[3]();
      await Promise.all(promises);
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
