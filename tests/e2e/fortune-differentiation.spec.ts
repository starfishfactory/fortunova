import { test, expect, type Page } from '@playwright/test';

/**
 * 운세 결과 차별화 테스트
 * 서로 다른 프로필의 운세 결과가 충분히 다른지 비교한다.
 */

interface FortuneResult {
  label: string;
  fullText: string;
  summary: string;
  advice: string;
  scores: string[];
  subFortunes: string[];
  html: string;
}

interface ProfileInput {
  label: string;
  year: string;
  month: string;
  day: string;
  hour: string;
  gender: 'M' | 'F';
  category: string;
}

const PROFILES: ProfileInput[] = [
  {
    label: 'A (1955년 여성, daily)',
    year: '1955',
    month: '3',
    day: '15',
    hour: '6',
    gender: 'F',
    category: 'daily',
  },
  {
    label: 'B (2000년 남성, daily)',
    year: '2000',
    month: '11',
    day: '28',
    hour: '22',
    gender: 'M',
    category: 'daily',
  },
  {
    label: 'C (1988년 남성, career)',
    year: '1988',
    month: '7',
    day: '22',
    hour: '14',
    gender: 'M',
    category: 'career',
  },
];

/** 텍스트를 의미 있는 문장 단위로 분리한다 */
function splitSentences(text: string): string[] {
  return text
    .split(/[.!?。\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 10); // 의미 있는 길이만
}

/** 두 텍스트의 문장 겹침 비율을 계산한다 (0~1, 낮을수록 차별화됨) */
function sentenceOverlapRatio(textA: string, textB: string): number {
  const sentencesA = splitSentences(textA);
  const sentencesB = splitSentences(textB);

  if (sentencesA.length === 0 || sentencesB.length === 0) return 0;

  let overlap = 0;
  for (const sa of sentencesA) {
    for (const sb of sentencesB) {
      // 문장이 80% 이상 겹치면 동일로 간주
      if (sa === sb || levenshteinSimilarity(sa, sb) > 0.8) {
        overlap++;
        break;
      }
    }
  }

  const total = Math.max(sentencesA.length, sentencesB.length);
  return overlap / total;
}

/** 두 문자열의 유사도 (0~1, Levenshtein 기반 간이 버전) */
function levenshteinSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  const longer = a.length >= b.length ? a : b;
  if (longer.length === 0) return 1;

  // 단어 단위 겹침으로 간이 계산
  const wordsA = new Set(a.split(/\s+/));
  const wordsB = new Set(b.split(/\s+/));
  let common = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) common++;
  }
  const union = new Set([...wordsA, ...wordsB]).size;
  return union === 0 ? 0 : common / union;
}

/** 페이지에서 localStorage 캐시를 클리어한다 */
async function clearCache(page: Page): Promise<void> {
  await page.evaluate(() => {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k?.startsWith('fortunova_')) localStorage.removeItem(k);
    }
  });
}

/** 프로필로 운세를 조회하고 결과를 추출한다 */
async function queryFortune(page: Page, profile: ProfileInput): Promise<FortuneResult> {
  await page.goto('/');
  await clearCache(page);

  // 폼 입력
  await page.selectOption('select[name="year"]', profile.year);
  await page.selectOption('select[name="month"]', profile.month);
  await page.selectOption('select[name="day"]', profile.day);
  await page.selectOption('select[name="hour"]', profile.hour);
  await page.check(`input[name="gender"][value="${profile.gender}"]`);
  await page.selectOption('select[name="category"]', profile.category);

  // 제출
  await page.click('button[type="submit"]');

  // 결과 대기 (캐시 히트 시 즉시, SSE 시 최대 150초)
  const result = page.locator('#result');
  await expect(result.locator('div').first()).toBeVisible({ timeout: 150_000 });

  // 에러 확인
  const html = await result.innerHTML();
  expect(html).not.toContain('LLM_UNAVAILABLE');
  expect(html).not.toContain('VALIDATION_ERROR');
  expect(html).not.toContain('파싱에 실패');

  const fullText = await result.innerText();

  // 요약 추출: "오늘의 운세" 섹션 텍스트
  const summaryMatch = fullText.match(/오늘의 운세[^\n]*\n([\s\S]*?)(?=(?:오행 흐름|세부 운세|오늘의 조언|$))/);
  const summary = summaryMatch?.[1]?.trim() ?? '';

  // 조언 추출
  const adviceMatch = fullText.match(/오늘의 조언[^\n]*\n([\s\S]*?)(?=(?:오늘의 팁|세부 운세|3개월|$))/);
  const advice = adviceMatch?.[1]?.trim() ?? '';

  // 점수 추출 (숫자+점 패턴)
  const scores = [...fullText.matchAll(/(\d+)\s*점/g)].map((m) => m[1]);

  // 세부 운세 항목 추출
  const subFortuneLabels = ['재물운', '건강운', '연애운', '직장운'];
  const subFortunes: string[] = [];
  for (const label of subFortuneLabels) {
    const regex = new RegExp(`${label}[^\n]*\n([\s\S]*?)(?=(?:재물운|건강운|연애운|직장운|오행 해설|행운의|$))`);
    const match = fullText.match(regex);
    if (match?.[1]) subFortunes.push(match[1].trim());
  }

  return {
    label: profile.label,
    fullText,
    summary,
    advice,
    scores,
    subFortunes,
    html,
  };
}

test.describe.serial('운세 결과 차별화 검증', () => {
  const results: FortuneResult[] = [];

  for (const profile of PROFILES) {
    test(`프로필 ${profile.label} 운세 조회`, async ({ page }) => {
      const result = await queryFortune(page, profile);
      results.push(result);

      // 기본 검증: 결과 텍스트가 충분히 긴지
      expect(result.fullText.length).toBeGreaterThan(200);
    });
  }

  test('3개 프로필의 운세 결과가 충분히 차별화된다', async () => {
    expect(results.length).toBe(3);

    const pairs: [number, number][] = [
      [0, 1],
      [0, 2],
      [1, 2],
    ];
    const pairLabels = ['A vs B', 'A vs C', 'B vs C'];

    // eslint-disable-next-line no-console
    console.log('\n========== 운세 차별화 분석 ==========\n');

    for (const r of results) {
      // eslint-disable-next-line no-console
      console.log(`[${r.label}] 텍스트 길이: ${r.fullText.length}자, 점수: [${r.scores.join(', ')}]`);
    }

    // 1. 전체 텍스트 유사도
    // eslint-disable-next-line no-console
    console.log('\n--- 문장 겹침 비율 (낮을수록 좋음) ---');
    const overlapRatios: number[] = [];

    for (let i = 0; i < pairs.length; i++) {
      const [a, b] = pairs[i];
      const ratio = sentenceOverlapRatio(results[a].fullText, results[b].fullText);
      overlapRatios.push(ratio);
      // eslint-disable-next-line no-console
      console.log(`  ${pairLabels[i]}: ${(ratio * 100).toFixed(1)}% 겹침`);
    }

    // 평균 겹침 비율이 30% 미만이어야 함
    const avgOverlap = overlapRatios.reduce((a, b) => a + b, 0) / overlapRatios.length;
    // eslint-disable-next-line no-console
    console.log(`  평균: ${(avgOverlap * 100).toFixed(1)}%`);
    expect(avgOverlap).toBeLessThan(0.3);

    // 2. 요약문 차별화
    // eslint-disable-next-line no-console
    console.log('\n--- 요약문 차별화 ---');
    for (let i = 0; i < pairs.length; i++) {
      const [a, b] = pairs[i];
      const sim = levenshteinSimilarity(results[a].summary, results[b].summary);
      // eslint-disable-next-line no-console
      console.log(`  ${pairLabels[i]}: 유사도 ${(sim * 100).toFixed(1)}%`);
      // 요약이 비어있지 않다면, 70% 미만 유사도여야 함
      if (results[a].summary && results[b].summary) {
        expect(sim, `${pairLabels[i]} 요약 유사도가 너무 높음`).toBeLessThan(0.7);
      }
    }

    // 3. 조언 차별화
    // eslint-disable-next-line no-console
    console.log('\n--- 조언 차별화 ---');
    for (let i = 0; i < pairs.length; i++) {
      const [a, b] = pairs[i];
      const sim = levenshteinSimilarity(results[a].advice, results[b].advice);
      // eslint-disable-next-line no-console
      console.log(`  ${pairLabels[i]}: 유사도 ${(sim * 100).toFixed(1)}%`);
      if (results[a].advice && results[b].advice) {
        expect(sim, `${pairLabels[i]} 조언 유사도가 너무 높음`).toBeLessThan(0.7);
      }
    }

    // 4. 점수 차별화 - 모든 프로필의 점수가 동일하면 안 됨
    // eslint-disable-next-line no-console
    console.log('\n--- 점수 차별화 ---');
    const scoreStrings = results.map((r) => r.scores.join(','));
    const allScoresSame = scoreStrings.every((s) => s === scoreStrings[0]);
    // eslint-disable-next-line no-console
    console.log(`  점수 배열: ${scoreStrings.map((s, i) => `${PROFILES[i].label.charAt(0)}=[${s}]`).join(', ')}`);
    // eslint-disable-next-line no-console
    console.log(`  모든 점수 동일: ${allScoresSame ? '예 (나쁨)' : '아니오 (좋음)'}`);
    expect(allScoresSame, '모든 프로필의 점수가 동일함').toBe(false);

    // 5. 세부 운세 차별화
    // eslint-disable-next-line no-console
    console.log('\n--- 세부 운세 차별화 ---');
    for (let i = 0; i < pairs.length; i++) {
      const [a, b] = pairs[i];
      const subA = results[a].subFortunes.join(' ');
      const subB = results[b].subFortunes.join(' ');
      if (subA && subB) {
        const sim = levenshteinSimilarity(subA, subB);
        // eslint-disable-next-line no-console
        console.log(`  ${pairLabels[i]}: 유사도 ${(sim * 100).toFixed(1)}%`);
        expect(sim, `${pairLabels[i]} 세부 운세 유사도가 너무 높음`).toBeLessThan(0.7);
      }
    }

    // 6. 사주 관련 용어 포함 여부
    // eslint-disable-next-line no-console
    console.log('\n--- 사주 용어 포함 여부 ---');
    const sajuTerms = ['사주', '오행', '천간', '지지', '갑', '을', '병', '정', '무', '기', '경', '신', '임', '계',
      '자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해',
      '목', '화', '토', '금', '수'];

    for (const r of results) {
      const found = sajuTerms.filter((term) => r.fullText.includes(term));
      // eslint-disable-next-line no-console
      console.log(`  [${r.label}] 사주 용어 ${found.length}개: ${found.slice(0, 10).join(', ')}...`);
      // 최소 5개 이상의 사주 관련 용어가 포함되어야 함
      expect(found.length, `${r.label} 사주 용어가 부족함`).toBeGreaterThanOrEqual(5);
    }

    // 7. 일간 명시적 언급 여부 (Generator-Critique loop 효과 검증)
    // eslint-disable-next-line no-console
    console.log('\n--- 일간(天干) 명시적 언급 ---');
    // 각 프로필의 사주에서 일간이 결과 텍스트에 "X 일간" 또는 "일간" 형태로 언급되는지 확인
    const dayMasterPattern = /일간/;
    for (const r of results) {
      const hasDayMasterRef = dayMasterPattern.test(r.fullText);
      // eslint-disable-next-line no-console
      console.log(`  [${r.label}] 일간 언급: ${hasDayMasterRef ? '예' : '아니오'}`);
      // 일간 관련 언급이 있어야 함 (강화된 프롬프트 효과)
      expect(hasDayMasterRef, `${r.label} 결과에 일간 언급이 없음`).toBe(true);
    }

    // 8. 오행 비율 구체적 수치 언급 여부
    // eslint-disable-next-line no-console
    console.log('\n--- 오행 비율 구체적 언급 ---');
    const elementPercentPattern = /\d+(\.\d+)?%/;
    for (const r of results) {
      const hasPercentage = elementPercentPattern.test(r.fullText);
      // eslint-disable-next-line no-console
      console.log(`  [${r.label}] 오행 비율 수치: ${hasPercentage ? '예' : '아니오'}`);
    }

    // 9. 카테고리 초점 확인 - career 프로필(C)이 직장/사업 관련 용어를 더 많이 포함
    // eslint-disable-next-line no-console
    console.log('\n--- 카테고리 초점 ---');
    const careerTerms = ['직장', '사업', '커리어', '승진', '리더십', '팀', '업무', '투자', '취업'];
    const careerCountC = careerTerms.filter((t) => results[2].fullText.includes(t)).length;
    const careerCountA = careerTerms.filter((t) => results[0].fullText.includes(t)).length;
    // eslint-disable-next-line no-console
    console.log(`  프로필 A (daily): 직장 용어 ${careerCountA}개`);
    // eslint-disable-next-line no-console
    console.log(`  프로필 C (career): 직장 용어 ${careerCountC}개`);

    // eslint-disable-next-line no-console
    console.log('\n========== 차별화 분석 완료 ==========\n');
  });
});
