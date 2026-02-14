import { Hono } from 'hono';
import type { BirthInput } from '@/engine/types/index.js';
import type { FortuneCategory } from '@/fortune/types.js';
import type { AppEnv } from '@/types/hono.js';
import { getFortune } from '@/services/fortune.js';
import { ErrorCodes } from '@/errors.js';

const fortune = new Hono<AppEnv>();

fortune.post('/fortune', async (c) => {
  const body = await c.req.json();

  const { year, month, day, hour, gender, isLunar, isLeapMonth, category } = body;

  if (!year || !month || !day || !gender) {
    return c.json(ErrorCodes.VALIDATION_ERROR, 400);
  }

  const input: BirthInput = {
    year: Number(year),
    month: Number(month),
    day: Number(day),
    hour: hour != null ? Number(hour) : null,
    gender: gender as 'M' | 'F',
    isLunar: !!isLunar,
    isLeapMonth: !!isLeapMonth,
  };

  const fortuneCategory: FortuneCategory = category || 'daily';
  const identifier = c.get('identifier') as string;
  const identifierType = c.get('identifierType') as 'user' | 'anonymous';

  try {
    const result = await getFortune(input, fortuneCategory, 'saju', identifier, identifierType);
    return c.json(result);
  } catch (e) {
    const msg = (e as Error).message;
    if (msg === '지원하지 않는 운세 시스템') {
      return c.json(ErrorCodes.UNSUPPORTED_SYSTEM, 400);
    }
    return c.json(ErrorCodes.LLM_UNAVAILABLE, 503);
  }
});

export default fortune;
