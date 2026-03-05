import type { FortuneSystem, FortuneCategory, FortuneResult, SystemAnalysis } from '../types.js';
import type { BirthInput } from '@/engine/types/index.js';
import type { SajuAnalysis } from '@/engine/types/analysis.js';
import { calculateFourPillars } from '@/engine/saju/four-pillars.js';
import { mapFourPillarsTenGods } from '@/engine/analysis/ten-gods.js';
import { calculateElementBalance } from '@/engine/analysis/element-balance.js';
import { determineDayMasterStrength } from '@/engine/analysis/day-master-strength.js';
import { calculateMajorFate } from '@/engine/saju/major-fate.js';

const CATEGORY_LABELS: Record<FortuneCategory, string> = {
  daily: '오늘의 운세',
  love: '애정운',
  career: '직장/사업운',
  health: '건강운',
  wealth: '재물운',
};

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
    const majorFate = calculateMajorFate(fourPillars, birthInput.gender, birthInput.year);

    const analysis: SajuAnalysis = {
      fourPillars,
      tenGods,
      elementBalance,
      dayMasterStrength,
      usefulGod: '목',
      majorFate,
    };

    return {
      systemId: 'saju',
      data: analysis as unknown as Record<string, unknown>,
    };
  },

  buildPrompt(analysis: SystemAnalysis, category: FortuneCategory): string {
    const data = analysis.data as unknown as SajuAnalysis;
    const { fourPillars, elementBalance, dayMasterStrength, majorFate } = data;

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

    return [
      `다음은 한국 전통 사주/명리 운세 웹 애플리케이션(Fortunova)의 콘텐츠 생성 작업입니다.`,
      `아래 사주 분석 데이터를 기반으로 사용자에게 표시할 운세 JSON 데이터를 생성해주세요.`,
      `따뜻하고 구체적이며 풍부한 콘텐츠로 작성해야 합니다.`,
      ``,
      `## 입력 데이터 (사주 분석 결과)`,
      `- 사주팔자: ${pillarStr}`,
      `- 일간: ${fourPillars.day.stem} (${dayMasterStrength})`,
      `- 오행 비율: ${elementStr}`,
      `- 대운 수: ${majorFate.length}개`,
      `- 오늘 날짜: ${today}`,
      ``,
      `## 요청`,
      `위 사주를 기반으로 "${CATEGORY_LABELS[category]}"를 종합적으로 분석해주세요.`,
      ``,
      `## 작성 지침`,
      `- summary: 핵심 운세를 감성적으로 요약 (20~40자)`,
      `- detail: 오행의 흐름과 사주 특성을 연결하여 구체적으로 설명. 시간대별 기운 변화, 대인관계 조언 포함 (500자 이상)`,
      `- advice: 오늘 실천할 수 있는 구체적이고 실용적인 행동 3가지 (200자 이상)`,
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
