import type { FortuneSystem, FortuneCategory, FortuneResult, DetailedFortuneResult, SystemAnalysis } from '../types.js';
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

    // 1. 사주팔자 계산
    const fourPillars = calculateFourPillars(birthInput);

    // 2. 십신 매핑
    const tenGods = mapFourPillarsTenGods(fourPillars);

    // 3. 오행 균형
    const elementBalance = calculateElementBalance(fourPillars);

    // 4. 일간 강약
    const dayMasterStrength = determineDayMasterStrength(fourPillars, elementBalance);

    // 5. 대운 계산
    const majorFate = calculateMajorFate(
      fourPillars,
      birthInput.gender,
      birthInput.year,
    );

    const analysis: SajuAnalysis = {
      fourPillars,
      tenGods,
      elementBalance,
      dayMasterStrength,
      usefulGod: '목', // TODO: Phase 3에서 용신 로직 구현
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

    return [
      `당신은 30년 경력의 한국 전통 사주/명리학 전문가입니다. 따뜻하고 구체적인 운세를 제공합니다.`,
      ``,
      `## 사주 정보`,
      `- 사주팔자: ${pillarStr}`,
      `- 일간: ${fourPillars.day.stem} (${dayMasterStrength})`,
      `- 오행 비율: ${elementStr}`,
      `- 대운 수: ${majorFate.length}개`,
      ``,
      `## 요청`,
      `위 사주를 기반으로 "${CATEGORY_LABELS[category]}"를 분석해주세요.`,
      ``,
      `## 작성 지침`,
      `- summary: 핵심 운세를 감성적으로 요약 (20~40자)`,
      `- detail: 오행의 흐름과 사주 특성을 연결하여 구체적으로 설명. 시간대별 기운 변화, 대인관계 조언 포함 (300자 이상)`,
      `- advice: 오늘 실천할 수 있는 구체적이고 실용적인 행동 2~3가지 (150자 이상)`,
      `- elementInsight: 이 사주의 오행 특성이 오늘 운세에 미치는 영향을 한두 문장으로`,
      `- dayTip: 오늘 하루를 위한 한줄 팁 (시간/장소/행동 중 하나)`,
      ``,
      `## 응답 형식`,
      `순수 JSON만 반환하세요. 마크다운 코드블록이나 설명 없이 JSON 객체만 출력하세요.`,
      `{`,
      `  "summary": "한줄 요약",`,
      `  "detail": "상세 설명 (300자 이상)",`,
      `  "score": 0-100,`,
      `  "advice": "구체적 조언 (150자 이상)",`,
      `  "luckyColor": "행운색",`,
      `  "luckyNumber": 행운숫자,`,
      `  "elementInsight": "오행 해설 한두 문장",`,
      `  "dayTip": "오늘의 한줄 팁"`,
      `}`,
    ].join('\n');
  },

  buildDetailedPrompt(analysis: SystemAnalysis, category: FortuneCategory): string {
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

    return [
      `당신은 전문 사주/명리 상담사입니다. 풍부하고 상세한 운세를 제공해주세요.`,
      ``,
      `## 사주 정보`,
      `- 사주팔자: ${pillarStr}`,
      `- 일간: ${fourPillars.day.stem} (${dayMasterStrength})`,
      `- 오행 비율: ${elementStr}`,
      `- 대운 수: ${majorFate.length}개`,
      ``,
      `## 요청`,
      `위 사주를 기반으로 "${CATEGORY_LABELS[category]}"를 종합적으로 분석해주세요.`,
      `각 세부 운세(재물, 건강, 연애, 직장), 오행 해설, 행운 정보, 주의사항, 3개월 운세 흐름, 궁합 팁, 대운 해석, 격언을 포함해주세요.`,
      ``,
      `## 응답 형식`,
      `순수 JSON만 반환하세요. 마크다운 코드블록이나 설명 없이 JSON 객체만 출력하세요.`,
      `{`,
      `  "summary": "한줄 요약",`,
      `  "detail": "상세 설명 (500자 이상)",`,
      `  "score": 0-100,`,
      `  "advice": "핵심 조언",`,
      `  "luckyColor": "행운색",`,
      `  "luckyNumber": 행운숫자,`,
      `  "subFortunes": {`,
      `    "wealth": { "score": 0-100, "description": "재물운 설명" },`,
      `    "health": { "score": 0-100, "description": "건강운 설명" },`,
      `    "love": { "score": 0-100, "description": "연애운 설명" },`,
      `    "career": { "score": 0-100, "description": "직장운 설명" }`,
      `  },`,
      `  "elementExplanation": "이 사주의 오행 특성과 현재 운세에 미치는 영향 해설",`,
      `  "lucky": { "color": "색상", "number": 숫자, "direction": "방위", "timeSlot": "시간대" },`,
      `  "cautions": "주의사항 (2~3문장)",`,
      `  "monthlyTrend": [`,
      `    { "month": "YYYY-MM", "trend": "운세 흐름", "rating": 1-5 },`,
      `    { "month": "YYYY-MM", "trend": "운세 흐름", "rating": 1-5 },`,
      `    { "month": "YYYY-MM", "trend": "운세 흐름", "rating": 1-5 }`,
      `  ],`,
      `  "compatibilityTip": "궁합/인간관계 팁",`,
      `  "proverb": "오늘에 맞는 격언이나 명언",`,
      `  "majorFateInterpretation": "현재 대운 흐름 해석"`,
      `}`,
    ].join('\n');
  },

  parseResult(llmResponse: string, tier?: 'basic' | 'detailed'): FortuneResult | DetailedFortuneResult {
    try {
      // LLM이 ```json ... ``` 코드 블록으로 감싸는 경우 처리
      let jsonStr = llmResponse.trim();
      const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1].trim();
      }
      const parsed = JSON.parse(jsonStr);
      const base: FortuneResult = {
        summary: parsed.summary ?? '분석 결과를 확인해주세요.',
        detail: parsed.detail ?? '',
        score: typeof parsed.score === 'number' ? parsed.score : 50,
        advice: parsed.advice ?? '',
        luckyColor: parsed.luckyColor,
        luckyNumber: parsed.luckyNumber,
        tier: tier ?? 'basic',
        elementInsight: parsed.elementInsight,
        dayTip: parsed.dayTip,
      };

      if (tier === 'detailed' && parsed.subFortunes) {
        const detailed: DetailedFortuneResult = {
          ...base,
          tier: 'detailed',
          subFortunes: {
            wealth: { score: parsed.subFortunes?.wealth?.score ?? 50, description: parsed.subFortunes?.wealth?.description ?? '' },
            health: { score: parsed.subFortunes?.health?.score ?? 50, description: parsed.subFortunes?.health?.description ?? '' },
            love: { score: parsed.subFortunes?.love?.score ?? 50, description: parsed.subFortunes?.love?.description ?? '' },
            career: { score: parsed.subFortunes?.career?.score ?? 50, description: parsed.subFortunes?.career?.description ?? '' },
          },
          elementExplanation: parsed.elementExplanation ?? '',
          lucky: {
            color: parsed.lucky?.color ?? parsed.luckyColor ?? '',
            number: parsed.lucky?.number ?? parsed.luckyNumber ?? 0,
            direction: parsed.lucky?.direction ?? '',
            timeSlot: parsed.lucky?.timeSlot ?? '',
          },
          cautions: parsed.cautions ?? '',
          monthlyTrend: Array.isArray(parsed.monthlyTrend) ? parsed.monthlyTrend.slice(0, 3) : [],
          compatibilityTip: parsed.compatibilityTip ?? '',
          proverb: parsed.proverb ?? '',
          majorFateInterpretation: parsed.majorFateInterpretation ?? '',
        };
        return detailed;
      }

      return base;
    } catch {
      return {
        summary: '응답 파싱에 실패했습니다. 다시 시도해주세요.',
        detail: llmResponse,
        score: 50,
        advice: '재시도를 권장합니다.',
        tier: tier ?? 'basic',
      };
    }
  },
};
