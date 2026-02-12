/**
 * 천간(天干) - 10개의 하늘 기운
 */
export type HeavenlyStem = '갑' | '을' | '병' | '정' | '무' | '기' | '경' | '신' | '임' | '계';

/**
 * 지지(地支) - 12개의 땅 기운
 */
export type EarthlyBranch = '자' | '축' | '인' | '묘' | '진' | '사' | '오' | '미' | '신' | '유' | '술' | '해';

/**
 * 오행(五行) - 만물의 구성 요소
 */
export type FiveElement = '목' | '화' | '토' | '금' | '수';

/**
 * 음양(陰陽)
 */
export type YinYang = '양' | '음';

/**
 * 간지(干支) - 천간 + 지지 조합
 */
export interface GanJi {
  stem: HeavenlyStem;
  branch: EarthlyBranch;
}

/**
 * 상생(相生) 관계 - 목→화→토→금→수→목
 * 상극(相剋) 관계 - 목→토→수→화→금→목
 */
export type ElementRelation = '상생' | '상극' | '비화' | '무관';
