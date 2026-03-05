import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import type { BirthInput } from '@/engine/types/index.js';
import type { FortuneCategory } from '@/fortune/types.js';
import type { AppEnv } from '@/types/hono.js';
import { getFortune, getFortuneStream } from '@/services/fortune.js';
import { FortuneResultPartial } from '@/views/fortune-result.js';
import { ErrorPartial } from '@/views/error.js';
import { LimitExceededPartial } from '@/views/limit-exceeded.js';
const fortunePartials = new Hono<AppEnv>();

/** SSE 스트리밍 운세 */
fortunePartials.get('/fortune-stream', async (c) => {
  const q = c.req.query();
  const year = q['year'];
  const month = q['month'];
  const day = q['day'];
  const hour = q['hour'];
  const gender = q['gender'];
  const calendarType = q['calendarType'];
  const isLeapMonth = q['isLeapMonth'];
  const category = q['category'] || 'daily';

  if (!year || !month || !day || !gender) {
    return c.text('missing params', 400);
  }

  const input: BirthInput = {
    year: Number(year),
    month: Number(month),
    day: Number(day),
    hour: hour ? Number(hour) : null,
    gender: gender as 'M' | 'F',
    isLunar: calendarType === 'lunar',
    isLeapMonth: isLeapMonth === 'true',
  };

  const identifier = c.get('identifier') as string || 'anon:unknown';
  const identifierType = (c.get('identifierType') as 'user' | 'anonymous') || 'anonymous';

  return streamSSE(c, async (stream) => {
    console.log('[sse] stream opened');
    try {
      await getFortuneStream(
        input,
        category as FortuneCategory,
        'saju',
        identifier,
        identifierType,
        async (event) => {
          console.log('[sse] event:', event.type, event.type === 'progress' ? event.chunk : '');
          try {
            if (event.type === 'progress') {
              await stream.writeSSE({ data: JSON.stringify({ type: 'progress', chunk: event.chunk, elapsed: event.elapsed }) });
            } else if (event.type === 'cached') {
              await stream.writeSSE({ data: JSON.stringify({ type: 'progress', chunk: 'cached', elapsed: 0 }) });
            } else if (event.type === 'done') {
              // HTML은 SSE로 보내지 않고, 완료 신호만 전송
              await stream.writeSSE({ data: JSON.stringify({ type: 'done' }) });
            } else if (event.type === 'error') {
              await stream.writeSSE({ data: JSON.stringify({ type: 'error', message: event.message }) });
            }
          } catch (innerErr) {
            console.error('[sse] event handler error:', (innerErr as Error).message, (innerErr as Error).stack);
          }
        },
      );
    } catch (outerErr) {
      console.error('[sse] stream error:', (outerErr as Error).message, (outerErr as Error).stack);
    }
    // flush 대기 후 종료
    await new Promise((r) => setTimeout(r, 500));
    console.log('[sse] stream closing');
  });
});

fortunePartials.post('/fortune-result', async (c) => {
  const body = await c.req.parseBody();

  const year = body['year'] as string;
  const month = body['month'] as string;
  const day = body['day'] as string;
  const hour = body['hour'] as string;
  const gender = body['gender'] as string;
  const calendarType = body['calendarType'] as string;
  const isLeapMonth = body['isLeapMonth'] as string;
  const category = (body['category'] as string) || 'daily';

  if (!year || !month || !day || !gender) {
    return c.html(
      <ErrorPartial code="VALIDATION_ERROR" message="생년월일과 성별을 입력해주세요" />,
    );
  }

  const input: BirthInput = {
    year: Number(year),
    month: Number(month),
    day: Number(day),
    hour: hour ? Number(hour) : null,
    gender: gender as 'M' | 'F',
    isLunar: calendarType === 'lunar',
    isLeapMonth: isLeapMonth === 'true',
  };

  const identifier = c.get('identifier') as string || 'anon:unknown';
  const identifierType = (c.get('identifierType') as 'user' | 'anonymous') || 'anonymous';

  try {
    const result = await getFortune(
      input,
      category as FortuneCategory,
      'saju',
      identifier,
      identifierType,
    );
    return c.html(
      <FortuneResultPartial
        fortune={result.fortune}
        sajuSummary={result.sajuSummary}
        cached={result.cached}
        remainingFreeCount={result.remainingFreeCount}
      />,
    );
  } catch (e) {
    console.error('[fortune-result] Error:', (e as Error).message, (e as Error).stack);
    const msg = (e as Error).message;
    if (msg === 'DAILY_LIMIT_EXCEEDED' || msg.includes('일일')) {
      return c.html(<LimitExceededPartial />);
    }
    return c.html(
      <ErrorPartial code="LLM_UNAVAILABLE" message="운세 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요." />,
    );
  }
});

export default fortunePartials;
