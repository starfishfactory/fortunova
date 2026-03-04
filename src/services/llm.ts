import { execFile } from 'child_process';
import { config } from '@/config.js';

/**
 * 세마포어 - 동시 실행 수 제한 (메모리 제한 R-003)
 */
class Semaphore {
  private current = 0;
  private queue: (() => void)[] = [];

  constructor(private max: number) {}

  async acquire(): Promise<void> {
    if (this.current < this.max) {
      this.current++;
      return;
    }
    return new Promise<void>((resolve) => {
      this.queue.push(() => {
        this.current++;
        resolve();
      });
    });
  }

  release(): void {
    this.current--;
    const next = this.queue.shift();
    if (next) next();
  }

  /** 테스트용 리셋 */
  reset(): void {
    this.current = 0;
    this.queue = [];
  }
}

const claudeSemaphore = new Semaphore(1);

/** 테스트용 세마포어 리셋 */
export function _resetSemaphore(): void {
  claudeSemaphore.reset();
}

export type ClaudeModel = 'haiku' | 'sonnet';

function buildCommand(prompt: string, model?: ClaudeModel): { cmd: string; args: string[] } {
  if (config.claudeMode === 'docker') {
    const args = ['exec', config.claudeContainer, 'claude', '-p', prompt, '--output-format', 'text'];
    if (model) args.push('--model', model);
    return { cmd: 'docker', args };
  }
  const args = ['--print', '-p', prompt];
  if (model) args.push('--model', model);
  return { cmd: 'claude', args };
}

/**
 * Claude CLI headless 모드로 프롬프트를 전송하고 응답을 받는다.
 */
export async function callClaude(prompt: string, model?: ClaudeModel): Promise<string> {
  await claudeSemaphore.acquire();
  try {
    return await executeClaudeCli(prompt, model);
  } finally {
    claudeSemaphore.release();
  }
}

function executeClaudeCli(prompt: string, model?: ClaudeModel): Promise<string> {
  const { cmd, args } = buildCommand(prompt, model);
  const timeout = model === 'sonnet' ? Math.max(config.claudeTimeout, 90000) : config.claudeTimeout;
  return new Promise((resolve, reject) => {
    execFile(
      cmd,
      args,
      { timeout },
      (error, stdout, _stderr) => {
        if (error) {
          if ((error as NodeJS.ErrnoException & { killed?: boolean }).killed) {
            reject(new Error(`Claude CLI 타임아웃 (${config.claudeTimeout / 1000}초 초과)`));
            return;
          }
          reject(new Error(`Claude CLI 에러: ${error.message}`));
          return;
        }
        const result = stdout.trim();
        if (!result) {
          reject(new Error('Claude CLI 빈 응답'));
          return;
        }
        resolve(result);
      },
    );
  });
}
