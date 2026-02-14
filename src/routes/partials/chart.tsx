import { Hono } from 'hono';
import type { BirthInput } from '@/engine/types/index.js';
import { calculateFourPillars } from '@/engine/saju/four-pillars.js';
import { calculateMajorFate } from '@/engine/saju/major-fate.js';
import { calculateYearlyFateRange } from '@/engine/saju/yearly-fate.js';
import { ChartPartial } from '@/views/chart.js';
import { ErrorPartial } from '@/views/error.js';

const chartPartials = new Hono();

chartPartials.post('/chart', async (c) => {
  const body = await c.req.parseBody();

  const year = body['year'] as string;
  const month = body['month'] as string;
  const day = body['day'] as string;
  const hour = body['hour'] as string;
  const gender = body['gender'] as string;
  const calendarType = body['calendarType'] as string;
  const isLeapMonth = body['isLeapMonth'] as string;

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

  const fourPillars = calculateFourPillars(input);
  const majorFate = calculateMajorFate(fourPillars, input.gender, input.year);

  const currentYear = new Date().getFullYear();
  const yearlyFate = calculateYearlyFateRange(currentYear - 2, currentYear + 7);
  const currentAge = currentYear - input.year + 1;

  return c.html(
    <ChartPartial
      majorFate={majorFate}
      yearlyFate={yearlyFate}
      currentAge={currentAge}
    />,
  );
});

export default chartPartials;
