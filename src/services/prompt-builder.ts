import type { SajuAnalysis } from '@/engine/types/index.js';
import type { FortuneCategory } from '@/fortune/types.js';
import { getStemElement } from '@/engine/core/heavenly-stems.js';

const CATEGORY_LABELS: Record<FortuneCategory, string> = {
  daily: '종합운 (오늘의 운세)',
  love: '연애/애정운',
  career: '직장/사업운',
  health: '건강운',
  wealth: '재물/금전운',
};

function formatPillar(ganJi: { stem: string; branch: string }): string {
  return `${ganJi.stem}${ganJi.branch}`;
}

/**
 * 사주 분석 결과를 기반으로 운세 LLM 프롬프트를 생성한다.
 */
export function buildFortunePrompt(
  analysis: SajuAnalysis,
  category: FortuneCategory,
  date: string,
): string {
  const { fourPillars, dayMasterStrength, elementBalance, usefulGod } = analysis;
  const dayMasterElement = getStemElement(fourPillars.day.stem);

  const pillarsStr = [
    formatPillar(fourPillars.year),
    formatPillar(fourPillars.month),
    formatPillar(fourPillars.day),
    formatPillar(fourPillars.hour),
  ].join(' ');

  return `당신은 한국 전통 사주/명리학 전문가입니다.
다음 사주 분석 결과를 바탕으로 ${CATEGORY_LABELS[category]} 운세를 작성해주세요.

[사주 정보]
- 사주: ${pillarsStr}
- 일간: ${fourPillars.day.stem} (${dayMasterElement})
- 일간 강약: ${dayMasterStrength}
- 오행 균형: 목${elementBalance['목']}% 화${elementBalance['화']}% 토${elementBalance['토']}% 금${elementBalance['금']}% 수${elementBalance['수']}%
- 용신: ${usefulGod}

[요청]
- 날짜: ${date}
- 카테고리: ${CATEGORY_LABELS[category]}
- 500자~2000자 한국어로 작성
- JSON 형식으로 응답: {"summary":"한줄요약", "detail":"상세설명", "score":1-100, "advice":"조언", "luckyColor":"행운의색", "luckyNumber":1-9}`;
}
