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

const claudeSemaphore = new Semaphore(3);

/** 테스트용 세마포어 리셋 */
export function _resetSemaphore(): void {
  claudeSemaphore.reset();
}

/**
 * Claude Sonnet으로 프롬프트를 전송하고 응답을 받는다.
 * Base64 인코딩으로 프롬프트의 특수문자 이스케이프 문제를 회피한다.
 */
export async function callClaude(prompt: string, options?: { timeout?: number }): Promise<string> {
  await claudeSemaphore.acquire();
  try {
    return await executeClaudeCli(prompt, options?.timeout);
  } finally {
    claudeSemaphore.release();
  }
}

function executeClaudeCli(prompt: string, overrideTimeout?: number): Promise<string> {
  const timeout = overrideTimeout ?? Math.max(config.claudeTimeout, 120000);
  const b64 = Buffer.from(prompt, 'utf-8').toString('base64');

  return new Promise((resolve, reject) => {
    let cmd: string;
    let args: string[];

    if (config.claudeMode === 'docker') {
      // Base64 → 임시파일 → claude -p "$(cat file)" 방식으로 안전하게 전달
      cmd = 'docker';
      args = [
        'exec', config.claudeContainer,
        'sh', '-c',
        `echo '${b64}' | base64 -d > /tmp/_cp.txt && claude -p "$(cat /tmp/_cp.txt)" --output-format text --model haiku; rm -f /tmp/_cp.txt`,
      ];
    } else {
      cmd = 'sh';
      args = ['-c', `echo '${b64}' | base64 -d > /tmp/_cp.txt && claude --print -p "$(cat /tmp/_cp.txt)" --model haiku; rm -f /tmp/_cp.txt`];
    }

    execFile(
      cmd,
      args,
      { timeout, maxBuffer: 10 * 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) {
          if ((error as NodeJS.ErrnoException & { killed?: boolean }).killed) {
            reject(new Error(`Claude CLI 타임아웃 (${timeout / 1000}초 초과)`));
            return;
          }
          reject(new Error(`Claude CLI 에러: ${error.message}`));
          return;
        }
        const result = stdout.trim();
        if (!result) {
          reject(new Error(`Claude CLI 빈 응답 (stderr: ${(stderr ?? '').slice(0, 200)})`));
          return;
        }
        resolve(result);
      },
    );
  });
}
