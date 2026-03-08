import type { FortuneSystem, FortuneCategory, FortuneResult, SystemAnalysis } from '../types.js';
import type { BirthInput, SolarDate } from '@/engine/types/index.js';
import type { SajuAnalysis } from '@/engine/types/analysis.js';
import { calculateFourPillars } from '@/engine/saju/four-pillars.js';
import { mapFourPillarsTenGods } from '@/engine/analysis/ten-gods.js';
import { calculateElementBalance } from '@/engine/analysis/element-balance.js';
import { determineDayMasterStrength } from '@/engine/analysis/day-master-strength.js';
import { calculateMajorFate } from '@/engine/saju/major-fate.js';
import { analyzeSinsal } from '@/engine/analysis/sinsal.js';
import { analyzeAnnualFortune } from '@/engine/analysis/annual-fortune.js';
import { lunarToSolar } from '@/engine/calendar/lunar-converter.js';

const CATEGORY_LABELS: Record<FortuneCategory, string> = {
  daily: '오늘의 운세',
  love: '애정운',
  career: '직장/사업운',
  health: '건강운',
  wealth: '재물운',
};

/**
 * 카테고리별 특화 프롬프트 지침
 * 각 카테고리에 맞는 사주 관점과 초점을 명시한다.
 */
const CATEGORY_SPECIFIC_INSTRUCTIONS: Record<FortuneCategory, string> = {
  daily: [
    `## 카테고리 특화 지침 (오늘의 운세)`,
    `- 시간대별 에너지 흐름(寅時~亥時)에 따른 기운 변화를 설명하세요`,
    `- 오행의 전반적 균형이 하루 전체 운세에 미치는 영향을 분석하세요`,
    `- 일간의 특성을 "OO 일간인 당신은..." 형태로 반드시 언급하세요`,
    `- 세운/대운의 흐름이 오늘 하루에 어떤 영향을 주는지 연결하세요`,
  ].join('\n'),
  love: [
    `## 카테고리 특화 지침 (애정운)`,
    `- 일간의 성격 특성이 연애/관계에서 어떻게 발현되는지 구체적으로 설명하세요`,
    `- 오행 균형에서 火(열정), 水(감성), 木(성장)이 애정에 미치는 영향을 분석하세요`,
    `- 십신 중 정재/편재(남성 배우자운), 정관/편관(여성 배우자운)의 영향을 해석하세요`,
    `- 신살 중 도화살, 홍염살 등 연애 관련 신살이 있다면 반드시 언급하세요`,
    `- "OO 일간의 당신은 관계에서..." 형태로 시작하세요`,
  ].join('\n'),
  career: [
    `## 카테고리 특화 지침 (직장/사업운)`,
    `- 십신 분석을 통해 리더십 스타일(비겁=독립형, 식상=창의형, 재성=실리형, 관성=조직형, 인성=학구형)을 설명하세요`,
    `- 오행 균형에서 金(결단력), 木(추진력), 土(안정성)가 직장운에 미치는 영향을 분석하세요`,
    `- 세운의 십신이 직장/사업 기회에 미치는 영향을 구체적으로 해석하세요`,
    `- 대운 흐름에서 현재가 커리어 상승기/전환기/안정기인지 판단하세요`,
    `- "OO 일간인 당신의 직장에서의 강점은..." 형태로 시작하세요`,
  ].join('\n'),
  health: [
    `## 카테고리 특화 지침 (건강운)`,
    `- 오행 불균형으로 취약한 신체 부위를 구체적으로 지적하세요 (木=간/눈, 火=심장/소장, 土=위장/비장, 金=폐/대장, 水=신장/방광)`,
    `- 일간의 강약에 따른 에너지 관리 방법을 제안하세요 (신강=과로 주의, 신약=체력 보강)`,
    `- 오행 비율에서 가장 부족한 오행과 과다한 오행이 건강에 미치는 영향을 분석하세요`,
    `- 계절과 오행의 관계에서 현재 시기에 특히 주의할 건강 사항을 언급하세요`,
    `- "OO 일간이며 OO이(가) 부족한 당신은..." 형태로 시작하세요`,
  ].join('\n'),
  wealth: [
    `## 카테고리 특화 지침 (재물운)`,
    `- 십신에서 정재(안정 수입)/편재(투자·사업 수입)의 위치와 강약을 분석하세요`,
    `- 일간의 강약이 재물 관리 성향에 미치는 영향을 설명하세요 (신강=적극 투자, 신약=보수적 관리)`,
    `- 세운의 재성/비겁/식상이 올해 재물 흐름에 미치는 영향을 구체적으로 해석하세요`,
    `- 오행 균형에서 金(재물 보존), 水(재물 유동), 土(재물 축적)의 관계를 분석하세요`,
    `- "OO 일간의 당신은 재물 관리에서..." 형태로 시작하세요`,
  ].join('\n'),
};

/**
 * 사주 특성 참조 필수 지침 (모든 카테고리 공통)
 */
const SAJU_REFERENCING_MANDATE = [
  ``,
  `## 필수 참조 규칙 (반드시 준수)`,
  `1. 반드시 일간(天干)을 "OO 일간인 당신은..." 형태로 첫 문단에 언급하세요`,
  `2. 오행 비율에서 가장 강한 오행과 가장 약한 오행을 구체적 수치와 함께 언급하세요 (예: "화 기운이 32.5%로 가장 강한 당신에게...")`,
  `3. 신살이 있다면 최소 1개 이상 운세 해석에 반영하세요 (예: "역마살의 영향으로 이동/변화의 기운이...")`,
  `4. 세운(올해 운)의 십신과 지지 상호작용을 반드시 해석에 포함하세요`,
  `5. 일반적인 점술이 아닌, 이 사람의 사주 데이터에 기반한 개인화된 해석을 하세요`,
  `6. 다른 사주를 가진 사람에게는 완전히 다른 내용이 나와야 합니다`,
].join('\n');

export type ChunkType = 'core' | 'sub' | 'meta';

function buildSajuHeader(analysis: SystemAnalysis, category: FortuneCategory): string {
  const data = analysis.data as unknown as SajuAnalysis & { birthYear?: number; gender?: string };
  const { fourPillars, elementBalance, dayMasterStrength, majorFate, sinsal, annualFortune } = data;

  const pillarStr = [
    `년주: ${fourPillars.year.stem}${fourPillars.year.branch}`,
    `월주: ${fourPillars.month.stem}${fourPillars.month.branch}`,
    `일주: ${fourPillars.day.stem}${fourPillars.day.branch}`,
    `시주: ${fourPillars.hour.stem}${fourPillars.hour.branch}`,
  ].join(', ');

  const elementStr = Object.entries(elementBalance)
    .map(([el, ratio]) => `${el}: ${(ratio * 100).toFixed(1)}%`)
    .join(', ');

  const today = new Date().toISOString().slice(0, 10);
  const currentYear = new Date().getFullYear();
  const birthYear = data.birthYear ?? currentYear - 30;
  const koreanAge = currentYear - birthYear + 1;
  const internationalAge = currentYear - birthYear;
  const genderLabel = data.gender === 'F' ? '여성' : '남성';

  let lifeStage: string;
  if (internationalAge < 20) lifeStage = '학업과 진로 탐색기';
  else if (internationalAge < 28) lifeStage = '사회 초년생, 취업·자기계발 시기';
  else if (internationalAge < 35) lifeStage = '커리어 성장기, 결혼·연애 적극기';
  else if (internationalAge < 45) lifeStage = '사회적 안정기, 자녀 양육·승진 시기';
  else if (internationalAge < 55) lifeStage = '중년 전환기, 건강관리·재테크 중시 시기';
  else if (internationalAge < 65) lifeStage = '인생 후반 설계기, 은퇴 준비·건강 시기';
  else lifeStage = '노년기, 건강과 여유로운 삶 시기';

  // 신살 정보
  const sinsalStr = sinsal && sinsal.length > 0
    ? sinsal.map(s => `${s.name}(${s.position})`).join(', ')
    : '없음';

  // 세운 정보
  let annualStr = '';
  if (annualFortune) {
    const af = annualFortune;
    annualStr = `${af.year}년 ${af.ganJi.stem}${af.ganJi.branch}(${af.tenGod})`;
    if (af.interactions.length > 0) {
      annualStr += ` [${af.interactions.map(i => `${i.type}(${i.branches[0]}↔${i.branches[1]})`).join(', ')}]`;
    }
    if (af.currentMajorFate) {
      annualStr += ` 대운: ${af.currentMajorFate.ganJi.stem}${af.currentMajorFate.ganJi.branch}`;
    }
  }

  return [
    `한국 전통 사주/명리 운세 앱(Fortunova) 콘텐츠 생성.`,
    `사주 데이터를 기반으로 "${CATEGORY_LABELS[category]}" JSON을 생성하세요.`,
    ``,
    `## 사주 데이터`,
    `- 사주팔자: ${pillarStr}`,
    `- 일간: ${fourPillars.day.stem} (${dayMasterStrength})`,
    `- 오행 비율: ${elementStr}`,
    `- 신살: ${sinsalStr}`,
    `- 세운: ${annualStr || '없음'}`,
    `- 대운 수: ${majorFate.length}개`,
    `- 날짜: ${today} / ${genderLabel} / 만 ${internationalAge}세(한국 ${koreanAge}세)`,
    `- 생애 단계: ${lifeStage}`,
    ``,
    `나이·생애 단계에 맞는 현실적이고 공감되는 내용으로 작성하세요.`,
    `순수 JSON만 반환. 마크다운 코드블록 없이 JSON 객체만 출력.`,
  ].join('\n');
}

const CHUNK_PROMPTS: Record<ChunkType, string> = {
  core: [
    `## 생성할 필드`,
    `- summary: 핵심 운세 감성 요약 (20~40자)`,
    `- detail: 오행 흐름+사주 특성을 나이·생애 단계에 연결, 시간대별 기운 변화·대인관계 조언 (500자 이상)`,
    `- score: 종합 점수 0-100`,
    `- advice: 이 나이대에 맞는 오늘 실천 행동 3가지 (200자 이상)`,
    `- dayTip: 오늘 하루 구체적 한줄 팁`,
    `- proverb: 오늘에 맞는 한국 전통 격언/명언`,
    ``,
    `{ "summary": "", "detail": "", "score": 0, "advice": "", "dayTip": "", "proverb": "" }`,
  ].join('\n'),
  sub: [
    `## 생성할 필드`,
    `- subFortunes: 재물·건강·연애·직장 각각 점수(0-100)와 3~4문장 설명`,
    `- elementInsight: 이 사주 오행 특성이 오늘 운세에 미치는 영향 (100자 이상)`,
    `- elementExplanation: 오행 균형과 현재 기운의 관계 상세 해설 (150자 이상)`,
    ``,
    `{`,
    `  "subFortunes": {`,
    `    "wealth": { "score": 0, "description": "" },`,
    `    "health": { "score": 0, "description": "" },`,
    `    "love": { "score": 0, "description": "" },`,
    `    "career": { "score": 0, "description": "" }`,
    `  },`,
    `  "elementInsight": "",`,
    `  "elementExplanation": ""`,
    `}`,
  ].join('\n'),
  meta: [
    `## 생성할 필드`,
    `- lucky: 행운의 색·숫자·방위·시간대`,
    `- cautions: 오늘 주의할 점 2~3가지 (100자 이상)`,
    `- monthlyTrend: 향후 3개월 운세 흐름과 별점(1-5)`,
    `- compatibilityTip: 궁합/인간관계 팁 (50자 이상)`,
    `- majorFateInterpretation: 현재 대운 흐름 해석 (100자 이상)`,
    ``,
    `{`,
    `  "lucky": { "color": "", "number": 0, "direction": "", "timeSlot": "" },`,
    `  "cautions": "",`,
    `  "monthlyTrend": [{ "month": "YYYY-MM", "trend": "", "rating": 3 }],`,
    `  "compatibilityTip": "",`,
    `  "majorFateInterpretation": ""`,
    `}`,
  ].join('\n'),
};

export function buildChunkPrompts(analysis: SystemAnalysis, category: FortuneCategory): Record<ChunkType, string> {
  const header = buildSajuHeader(analysis, category);
  const categoryInstr = CATEGORY_SPECIFIC_INSTRUCTIONS[category];
  const mandate = SAJU_REFERENCING_MANDATE;
  return {
    core: header + '\n\n' + categoryInstr + mandate + '\n\n' + CHUNK_PROMPTS.core,
    sub: header + '\n\n' + categoryInstr + mandate + '\n\n' + CHUNK_PROMPTS.sub,
    meta: header + '\n\n' + categoryInstr + mandate + '\n\n' + CHUNK_PROMPTS.meta,
  };
}

/**
 * 생성된 운세 결과에 대한 비평 프롬프트를 생성한다.
 */
export function buildCritiquePrompt(
  analysis: SystemAnalysis,
  category: FortuneCategory,
  generatedCore: string,
): string {
  const data = analysis.data as unknown as SajuAnalysis & { birthYear?: number; gender?: string };
  const { fourPillars, elementBalance, dayMasterStrength, sinsal, annualFortune } = data;

  const dayMaster = fourPillars.day.stem;
  const sinsalNames = sinsal?.map(s => s.name).join(', ') || '없음';

  // 오행 중 최강/최약
  const sorted = Object.entries(elementBalance).sort(([, a], [, b]) => b - a);
  const strongest = `${sorted[0][0]}(${(sorted[0][1] * 100).toFixed(1)}%)`;
  const weakest = `${sorted[sorted.length - 1][0]}(${(sorted[sorted.length - 1][1] * 100).toFixed(1)}%)`;

  const annualTenGod = annualFortune?.tenGod ?? '없음';

  return [
    `아래 운세 결과의 품질을 평가하세요. 순수 JSON만 반환하세요.`,
    ``,
    `## 이 사람의 사주 핵심`,
    `- 일간: ${dayMaster} (${dayMasterStrength})`,
    `- 최강 오행: ${strongest}, 최약 오행: ${weakest}`,
    `- 신살: ${sinsalNames}`,
    `- 세운 십신: ${annualTenGod}`,
    `- 카테고리: ${CATEGORY_LABELS[category]}`,
    ``,
    `## 생성된 운세 (core 청크)`,
    generatedCore.slice(0, 1500),
    ``,
    `## 평가 기준`,
    `1. 일간 "${dayMaster}"이(가) 명시적으로 언급되었는가?`,
    `2. 오행 비율(${strongest}, ${weakest})이 구체적으로 참조되었는가?`,
    `3. 신살(${sinsalNames})이 해석에 반영되었는가?`,
    `4. 카테고리(${CATEGORY_LABELS[category]})에 맞는 초점인가?`,
    `5. 다른 사주의 사람과 구별되는 개인화된 내용인가?`,
    ``,
    `{ "score": 1~10, "feedback": "구체적 개선 피드백 (2~3문장)" }`,
  ].join('\n');
}

/**
 * 비평 결과를 파싱한다.
 */
export function parseCritiqueResult(response: string): {
  score: number;
  feedback: string;
  shouldRegenerate: boolean;
} {
  try {
    let jsonStr = response.trim();
    const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim();
    }
    const parsed = JSON.parse(jsonStr);
    const score = typeof parsed.score === 'number' ? parsed.score : 5;
    const feedback = parsed.feedback ?? '';
    return { score, feedback, shouldRegenerate: score < 7 };
  } catch {
    // 파싱 실패 시 재생성하지 않음
    return { score: 7, feedback: '', shouldRegenerate: false };
  }
}

/**
 * 비평 피드백을 반영한 강화된 core 프롬프트를 생성한다.
 */
export function buildEnhancedCorePrompt(
  analysis: SystemAnalysis,
  category: FortuneCategory,
  feedback: string,
): string {
  const header = buildSajuHeader(analysis, category);
  const categoryInstr = CATEGORY_SPECIFIC_INSTRUCTIONS[category];
  const mandate = SAJU_REFERENCING_MANDATE;
  return [
    header,
    '',
    categoryInstr,
    mandate,
    '',
    `## 이전 결과 피드백 (반드시 반영)`,
    `이전 생성 결과가 품질 기준 미달이었습니다. 다음 피드백을 반영하여 더 구체적으로 작성하세요:`,
    feedback,
    '',
    CHUNK_PROMPTS.core,
  ].join('\n');
}

function parseChunkJson(llmResponse: string): Record<string, unknown> {
  let jsonStr = llmResponse.trim();
  const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1].trim();
  }
  return JSON.parse(jsonStr);
}

export function mergeChunkResults(
  chunks: { type: ChunkType; response: string | null }[],
): FortuneResult {
  const merged: Record<string, unknown> = {};

  for (const chunk of chunks) {
    if (!chunk.response) continue;
    try {
      const parsed = parseChunkJson(chunk.response);
      Object.assign(merged, parsed);
    } catch (e) {
      console.error(`[saju] ${chunk.type} chunk parse failed:`, (e as Error).message);
    }
  }

  // core 필수 필드 검증
  if (!merged.summary && !merged.detail) {
    return {
      summary: '응답 파싱에 실패했습니다. 다시 시도해주세요.',
      detail: '',
      score: 50,
      advice: '재시도를 권장합니다.',
    };
  }

  const p = merged as Record<string, any>;
  return {
    summary: p.summary ?? '분석 결과를 확인해주세요.',
    detail: p.detail ?? '',
    score: typeof p.score === 'number' ? p.score : 50,
    advice: p.advice ?? '',
    luckyColor: p.luckyColor,
    luckyNumber: p.luckyNumber,
    elementInsight: p.elementInsight,
    dayTip: p.dayTip,
    subFortunes: p.subFortunes ? {
      wealth: { score: p.subFortunes.wealth?.score ?? 50, description: p.subFortunes.wealth?.description ?? '' },
      health: { score: p.subFortunes.health?.score ?? 50, description: p.subFortunes.health?.description ?? '' },
      love: { score: p.subFortunes.love?.score ?? 50, description: p.subFortunes.love?.description ?? '' },
      career: { score: p.subFortunes.career?.score ?? 50, description: p.subFortunes.career?.description ?? '' },
    } : undefined,
    elementExplanation: p.elementExplanation,
    lucky: p.lucky ? {
      color: p.lucky.color ?? '',
      number: p.lucky.number ?? 0,
      direction: p.lucky.direction ?? '',
      timeSlot: p.lucky.timeSlot ?? '',
    } : undefined,
    cautions: p.cautions,
    monthlyTrend: Array.isArray(p.monthlyTrend) ? p.monthlyTrend.slice(0, 3) : undefined,
    compatibilityTip: p.compatibilityTip,
    proverb: p.proverb,
    majorFateInterpretation: p.majorFateInterpretation,
  };
}

export const sajuSystem: FortuneSystem = {
  id: 'saju',
  name: '사주/명리',

  requiredInput: [
    { name: 'birthDate', type: 'date', required: true, label: '생년월일' },
    { name: 'birthTime', type: 'time', required: false, label: '태어난 시간' },
    { name: 'gender', type: 'select', required: true, label: '성별' },
    { name: 'isLunar', type: 'boolean', required: false, label: '음력 여부' },
  ],

  async analyze(input: Record<string, unknown>): Promise<SystemAnalysis> {
    const birthInput = input as unknown as BirthInput;
    const fourPillars = calculateFourPillars(birthInput);
    const tenGods = mapFourPillarsTenGods(fourPillars);
    const elementBalance = calculateElementBalance(fourPillars);
    const dayMasterStrength = determineDayMasterStrength(fourPillars, elementBalance);

    // 양력 날짜 추출 (음력인 경우 변환)
    let solarDate: SolarDate;
    if (birthInput.isLunar) {
      solarDate = lunarToSolar({
        year: birthInput.year,
        month: birthInput.month,
        day: birthInput.day,
        isLeapMonth: birthInput.isLeapMonth,
      });
    } else {
      solarDate = { year: birthInput.year, month: birthInput.month, day: birthInput.day };
    }
    const majorFate = calculateMajorFate(fourPillars, birthInput.gender, solarDate);

    // 신살 분석
    const sinsal = analyzeSinsal(fourPillars);

    // 세운 분석 (현재 연도)
    const currentYear = new Date().getFullYear();
    const annualFortune = analyzeAnnualFortune(
      fourPillars,
      majorFate,
      currentYear,
      solarDate.year,
    );

    const analysis: SajuAnalysis = {
      fourPillars,
      tenGods,
      elementBalance,
      dayMasterStrength,
      usefulGod: '목',
      majorFate,
      sinsal,
      annualFortune,
    };

    return {
      systemId: 'saju',
      data: { ...analysis, birthYear: birthInput.year, gender: birthInput.gender } as unknown as Record<string, unknown>,
    };
  },

  buildPrompt(analysis: SystemAnalysis, category: FortuneCategory): string {
    const data = analysis.data as unknown as SajuAnalysis & { birthYear?: number; gender?: string };
    const { fourPillars, elementBalance, dayMasterStrength, majorFate, sinsal, annualFortune } = data;

    const pillarStr = [
      `년주: ${fourPillars.year.stem}${fourPillars.year.branch}`,
      `월주: ${fourPillars.month.stem}${fourPillars.month.branch}`,
      `일주: ${fourPillars.day.stem}${fourPillars.day.branch}`,
      `시주: ${fourPillars.hour.stem}${fourPillars.hour.branch}`,
    ].join(', ');

    const elementStr = Object.entries(elementBalance)
      .map(([el, ratio]) => `${el}: ${(ratio * 100).toFixed(1)}%`)
      .join(', ');

    const today = new Date().toISOString().slice(0, 10);
    const currentYear = new Date().getFullYear();
    const birthYear = data.birthYear ?? currentYear - 30;
    const koreanAge = currentYear - birthYear + 1;
    const internationalAge = currentYear - birthYear;
    const genderLabel = data.gender === 'F' ? '여성' : '남성';

    // 나이대별 생애 단계
    let lifeStage: string;
    if (internationalAge < 20) lifeStage = '학업과 진로 탐색기';
    else if (internationalAge < 28) lifeStage = '사회 초년생, 취업·자기계발 시기';
    else if (internationalAge < 35) lifeStage = '커리어 성장기, 결혼·연애 적극기';
    else if (internationalAge < 45) lifeStage = '사회적 안정기, 자녀 양육·승진 시기';
    else if (internationalAge < 55) lifeStage = '중년 전환기, 건강관리·재테크 중시 시기';
    else if (internationalAge < 65) lifeStage = '인생 후반 설계기, 은퇴 준비·건강 시기';
    else lifeStage = '노년기, 건강과 여유로운 삶 시기';

    // 신살 정보
    const sinsalStr = sinsal && sinsal.length > 0
      ? sinsal.map(s => `${s.name}(${s.position}): ${s.description}`).join(', ')
      : '없음';

    // 세운 정보
    let annualStr = '';
    if (annualFortune) {
      const af = annualFortune;
      annualStr = `${af.year}년 ${af.ganJi.stem}${af.ganJi.branch}(천간 십신: ${af.tenGod}, 지지 십신: ${af.branchTenGod})`;
      if (af.interactions.length > 0) {
        annualStr += ` / 지지 상호작용: ${af.interactions.map(i => `${i.position} ${i.type}(${i.branches[0]}↔${i.branches[1]})`).join(', ')}`;
      }
      if (af.currentMajorFate) {
        annualStr += ` / 현재 대운: ${af.currentMajorFate.ganJi.stem}${af.currentMajorFate.ganJi.branch}(${af.currentMajorFate.startAge}~${af.currentMajorFate.endAge}세)`;
      }
    }

    return [
      `다음은 한국 전통 사주/명리 운세 웹 애플리케이션(Fortunova)의 콘텐츠 생성 작업입니다.`,
      `아래 사주 분석 데이터를 기반으로 사용자에게 표시할 운세 JSON 데이터를 생성해주세요.`,
      `따뜻하고 구체적이며 풍부한 콘텐츠로 작성해야 합니다.`,
      ``,
      `## 입력 데이터 (사주 분석 결과)`,
      `- 사주팔자: ${pillarStr}`,
      `- 일간: ${fourPillars.day.stem} (${dayMasterStrength})`,
      `- 오행 비율: ${elementStr}`,
      `- 신살: ${sinsalStr}`,
      `- 세운: ${annualStr || '없음'}`,
      `- 대운 수: ${majorFate.length}개`,
      `- 오늘 날짜: ${today}`,
      `- 성별: ${genderLabel}`,
      `- 만 나이: ${internationalAge}세 (한국 나이 ${koreanAge}세)`,
      `- 생애 단계: ${lifeStage}`,
      ``,
      `## 요청`,
      `위 사주를 기반으로 "${CATEGORY_LABELS[category]}"를 종합적으로 분석해주세요.`,
      `반드시 이 사람의 나이(${internationalAge}세 ${genderLabel})와 현재 생애 단계(${lifeStage})에 맞는 현실적이고 공감되는 조언을 해주세요.`,
      `예: 20대면 취업·연애·자기계발, 30대면 결혼·육아·커리어, 40~50대면 건강·재테크·자녀교육, 60대 이상이면 건강·노후·가족관계 등.`,
      ``,
      `## 작성 지침`,
      `- summary: 핵심 운세를 감성적으로 요약 (20~40자)`,
      `- detail: 오행의 흐름과 사주 특성을 이 사람의 나이·생애 단계에 연결하여 구체적으로 설명. 시간대별 기운 변화, 대인관계 조언 포함 (500자 이상)`,
      `- advice: 이 나이대에 맞는 오늘 실천할 수 있는 구체적이고 실용적인 행동 3가지 (200자 이상)`,
      `- elementInsight: 이 사주의 오행 특성이 오늘 운세에 미치는 영향 (100자 이상)`,
      `- dayTip: 오늘 하루를 위한 구체적 한줄 팁`,
      `- subFortunes: 재물·건강·연애·직장 각각 점수와 3~4문장 설명`,
      `- elementExplanation: 오행 균형과 현재 기운의 관계를 상세 해설 (150자 이상)`,
      `- lucky: 행운의 색·숫자·방위·시간대`,
      `- cautions: 오늘 주의할 점 2~3가지 (100자 이상)`,
      `- monthlyTrend: 향후 3개월 운세 흐름과 별점`,
      `- compatibilityTip: 궁합/인간관계 팁 (50자 이상)`,
      `- proverb: 오늘에 맞는 한국 전통 격언이나 명언`,
      `- majorFateInterpretation: 현재 대운 흐름 해석 (100자 이상)`,
      ``,
      `## 응답 형식`,
      `순수 JSON만 반환하세요. 마크다운 코드블록이나 설명 없이 JSON 객체만 출력하세요.`,
      `{`,
      `  "summary": "한줄 요약",`,
      `  "detail": "상세 설명 (500자 이상)",`,
      `  "score": 0-100,`,
      `  "advice": "구체적 조언 (200자 이상)",`,
      `  "luckyColor": "행운색",`,
      `  "luckyNumber": 숫자,`,
      `  "elementInsight": "오행 해설 (100자 이상)",`,
      `  "dayTip": "오늘의 한줄 팁",`,
      `  "subFortunes": {`,
      `    "wealth": { "score": 0-100, "description": "재물운 설명 3~4문장" },`,
      `    "health": { "score": 0-100, "description": "건강운 설명 3~4문장" },`,
      `    "love": { "score": 0-100, "description": "연애운 설명 3~4문장" },`,
      `    "career": { "score": 0-100, "description": "직장운 설명 3~4문장" }`,
      `  },`,
      `  "elementExplanation": "오행 균형 상세 해설 (150자 이상)",`,
      `  "lucky": { "color": "색상", "number": 숫자, "direction": "방위", "timeSlot": "시간대" },`,
      `  "cautions": "주의사항 (100자 이상)",`,
      `  "monthlyTrend": [`,
      `    { "month": "YYYY-MM", "trend": "운세 흐름 설명", "rating": 1-5 },`,
      `    { "month": "YYYY-MM", "trend": "운세 흐름 설명", "rating": 1-5 },`,
      `    { "month": "YYYY-MM", "trend": "운세 흐름 설명", "rating": 1-5 }`,
      `  ],`,
      `  "compatibilityTip": "궁합/인간관계 팁 (50자 이상)",`,
      `  "proverb": "한국 전통 격언이나 명언",`,
      `  "majorFateInterpretation": "현재 대운 흐름 해석 (100자 이상)"`,
      `}`,
    ].join('\n');
  },

  parseResult(llmResponse: string): FortuneResult {
    try {
      let jsonStr = llmResponse.trim();
      const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1].trim();
      }
      const parsed = JSON.parse(jsonStr);
      return {
        summary: parsed.summary ?? '분석 결과를 확인해주세요.',
        detail: parsed.detail ?? '',
        score: typeof parsed.score === 'number' ? parsed.score : 50,
        advice: parsed.advice ?? '',
        luckyColor: parsed.luckyColor,
        luckyNumber: parsed.luckyNumber,
        elementInsight: parsed.elementInsight,
        dayTip: parsed.dayTip,
        subFortunes: parsed.subFortunes ? {
          wealth: { score: parsed.subFortunes.wealth?.score ?? 50, description: parsed.subFortunes.wealth?.description ?? '' },
          health: { score: parsed.subFortunes.health?.score ?? 50, description: parsed.subFortunes.health?.description ?? '' },
          love: { score: parsed.subFortunes.love?.score ?? 50, description: parsed.subFortunes.love?.description ?? '' },
          career: { score: parsed.subFortunes.career?.score ?? 50, description: parsed.subFortunes.career?.description ?? '' },
        } : undefined,
        elementExplanation: parsed.elementExplanation,
        lucky: parsed.lucky ? {
          color: parsed.lucky.color ?? parsed.luckyColor ?? '',
          number: parsed.lucky.number ?? parsed.luckyNumber ?? 0,
          direction: parsed.lucky.direction ?? '',
          timeSlot: parsed.lucky.timeSlot ?? '',
        } : undefined,
        cautions: parsed.cautions,
        monthlyTrend: Array.isArray(parsed.monthlyTrend) ? parsed.monthlyTrend.slice(0, 3) : undefined,
        compatibilityTip: parsed.compatibilityTip,
        proverb: parsed.proverb,
        majorFateInterpretation: parsed.majorFateInterpretation,
      };
    } catch {
      return {
        summary: '응답 파싱에 실패했습니다. 다시 시도해주세요.',
        detail: llmResponse,
        score: 50,
        advice: '재시도를 권장합니다.',
      };
    }
  },
};
