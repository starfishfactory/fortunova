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
      `당신은 전문 사주/명리 상담사입니다.`,
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
      `## 응답 형식 (JSON)`,
      `{ "summary": "한줄 요약", "detail": "상세 설명", "score": 0-100, "advice": "조언", "luckyColor": "행운색", "luckyNumber": 행운숫자 }`,
    ].join('\n');
  },

  parseResult(llmResponse: string): FortuneResult {
    try {
      const parsed = JSON.parse(llmResponse);
      return {
        summary: parsed.summary ?? '분석 결과를 확인해주세요.',
        detail: parsed.detail ?? '',
        score: typeof parsed.score === 'number' ? parsed.score : 50,
        advice: parsed.advice ?? '',
        luckyColor: parsed.luckyColor,
        luckyNumber: parsed.luckyNumber,
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
