import { Hono } from 'hono';
import type { BirthInput } from '@/engine/types/index.js';
import type { FortuneCategory } from '@/fortune/types.js';
import type { AppEnv } from '@/types/hono.js';
import { getFortune } from '@/services/fortune.js';
import { FortuneResultPartial } from '@/views/fortune-result.js';
import { ErrorPartial } from '@/views/error.js';
import { LimitExceededPartial } from '@/views/limit-exceeded.js';

const fortunePartials = new Hono<AppEnv>();

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
