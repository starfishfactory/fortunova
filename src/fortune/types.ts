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
 * 운세 결과
 */
export interface FortuneResult {
  summary: string;
  detail: string;
  score: number;
  advice: string;
  luckyColor?: string;
  luckyNumber?: number;
  tier?: 'basic' | 'detailed';
  elementInsight?: string;
  dayTip?: string;
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
 * 상세 운세 결과 (2-tier detailed)
 */
export interface DetailedFortuneResult extends FortuneResult {
  tier: 'detailed';
  subFortunes: {
    wealth: SubFortune;
    health: SubFortune;
    love: SubFortune;
    career: SubFortune;
  };
  elementExplanation: string;
  lucky?: LuckyInfo;
  cautions?: string;
  monthlyTrend?: MonthlyTrend[];
  compatibilityTip?: string;
  proverb?: string;
  majorFateInterpretation?: string;
}

/**
 * FortuneSystem 플러그인 인터페이스 (FR-007)
 *
 * 새로운 운세 체계(타로, 별자리 등)를 구현하여 registry에 등록하면
 * API에서 즉시 사용 가능하다.
 */
export interface FortuneSystem {
  /** 시스템 고유 ID: 'saju', 'tarot', 'zodiac' */
  id: string;
  /** 표시 이름: '사주/명리', '타로', '별자리' */
  name: string;
  /** 필요한 입력 필드 정의 */
  requiredInput: InputField[];
  /** 입력 데이터를 분석하여 시스템 고유 분석 결과 반환 */
  analyze(input: Record<string, unknown>): Promise<SystemAnalysis>;
  /** 분석 결과를 LLM 프롬프트로 변환 (basic tier) */
  buildPrompt(analysis: SystemAnalysis, category: FortuneCategory): string;
  /** 분석 결과를 상세 LLM 프롬프트로 변환 (detailed tier) */
  buildDetailedPrompt?(analysis: SystemAnalysis, category: FortuneCategory): string;
  /** LLM 응답을 파싱하여 FortuneResult로 변환 */
  parseResult(llmResponse: string, tier?: 'basic' | 'detailed'): FortuneResult | DetailedFortuneResult;
}
