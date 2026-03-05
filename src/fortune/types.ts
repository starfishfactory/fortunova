/**
 * 운세 카테고리
 */
export type FortuneCategory = 'daily' | 'love' | 'career' | 'health' | 'wealth';

/**
 * 입력 필드 정의
 */
export interface InputField {
  name: string;
  type: 'date' | 'time' | 'select' | 'boolean';
  required: boolean;
  label: string;
}

/**
 * 운세 시스템 분석 결과 (공통 래퍼)
 */
export interface SystemAnalysis {
  systemId: string;
  data: Record<string, unknown>;
}

/**
 * 세부 운세 항목
 */
export interface SubFortune {
  score: number;
  description: string;
}

/**
 * 행운 정보
 */
export interface LuckyInfo {
  color: string;
  number: number;
  direction: string;
  timeSlot: string;
}

/**
 * 월간 운세 트렌드
 */
export interface MonthlyTrend {
  month: string;
  trend: string;
  rating: number;
}

/**
 * 운세 결과 — Sonnet 전용 풍부한 결과
 */
export interface FortuneResult {
  summary: string;
  detail: string;
  score: number;
  advice: string;
  luckyColor?: string;
  luckyNumber?: number;
  elementInsight?: string;
  dayTip?: string;
  subFortunes?: {
    wealth: SubFortune;
    health: SubFortune;
    love: SubFortune;
    career: SubFortune;
  };
  elementExplanation?: string;
  lucky?: LuckyInfo;
  cautions?: string;
  monthlyTrend?: MonthlyTrend[];
  compatibilityTip?: string;
  proverb?: string;
  majorFateInterpretation?: string;
}

/**
 * FortuneSystem 플러그인 인터페이스 (FR-007)
 */
export interface FortuneSystem {
  id: string;
  name: string;
  requiredInput: InputField[];
  analyze(input: Record<string, unknown>): Promise<SystemAnalysis>;
  buildPrompt(analysis: SystemAnalysis, category: FortuneCategory): string;
  parseResult(llmResponse: string): FortuneResult;
}
