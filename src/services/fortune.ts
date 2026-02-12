import type { BirthInput } from '@/engine/types/index.js';
import type { FortuneCategory, FortuneResult } from '@/fortune/types.js';
import { fortuneRegistry } from '@/fortune/registry.js';
import { callClaude } from '@/services/llm.js';
import { getDatabase } from '@/db/connection.js';
import { config } from '@/config.js';

export interface GetFortuneResult {
  fortune: FortuneResult;
  sajuSummary: {
    fourPillars: string;
    dayMasterStrength: string;
    todayElement: string;
  };
  cached: boolean;
  remainingFreeCount: number;
}

function buildCacheKey(
  input: BirthInput,
  date: string,
  category: FortuneCategory,
  systemId: string,
): string {
  const inputKey = `${input.year}-${input.month}-${input.day}-${input.hour ?? 'null'}-${input.isLunar}-${input.gender}`;
  return `${inputKey}:${date}:${category}:${systemId}`;
}

function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * 운세 오케스트레이션: 캐시 → 분석 → LLM → 저장
 */
export async function getFortune(
  input: BirthInput,
  category: FortuneCategory,
  systemId: string,
): Promise<GetFortuneResult> {
  // 1. 시스템 조회
  const system = fortuneRegistry.get(systemId);
  if (!system) {
    throw new Error('지원하지 않는 운세 시스템');
  }

  const db = getDatabase();
  const date = getTodayDate();
  const cacheKey = buildCacheKey(input, date, category, systemId);

  // 2. 캐시 조회
  const cached = db.prepare(
    'SELECT fortune, score, saju_data FROM fortune_cache WHERE cache_key = ?',
  ).get(cacheKey) as { fortune: string; score: number; saju_data: string } | undefined;

  if (cached) {
    const fortune: FortuneResult = JSON.parse(cached.fortune);
    const sajuSummary = JSON.parse(cached.saju_data);
    const usage = db.prepare(
      'SELECT count FROM daily_usage WHERE identifier = ? AND date = ?',
    ).get(cacheKey, date) as { count: number } | undefined;

    return {
      fortune,
      sajuSummary,
      cached: true,
      remainingFreeCount: config.dailyFreeLimit - (usage?.count ?? 0),
    };
  }

  // 3. 분석 → 프롬프트 → LLM → 파싱
  const analysis = await system.analyze(input as Record<string, unknown>);
  const prompt = system.buildPrompt(analysis, category);
  const llmResponse = await callClaude(prompt);
  const fortune = system.parseResult(llmResponse);

  const sajuSummary = {
    fourPillars: (analysis.data.fourPillars as string) ?? '',
    dayMasterStrength: (analysis.data.dayMasterStrength as string) ?? '',
    todayElement: (analysis.data.todayElement as string) ?? '',
  };

  // 4. 캐시 저장
  const expiresAt = `${date}T23:59:59`;
  db.prepare(
    `INSERT OR REPLACE INTO fortune_cache (cache_key, date, category, system_id, saju_data, fortune, score, expires_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    cacheKey, date, category, systemId,
    JSON.stringify(sajuSummary),
    JSON.stringify(fortune),
    fortune.score,
    expiresAt,
    new Date().toISOString(),
  );

  // 5. 사용량 증가
  const usage = db.prepare(
    'SELECT count FROM daily_usage WHERE identifier = ? AND date = ?',
  ).get(cacheKey, date) as { count: number } | undefined;

  if (usage) {
    db.prepare(
      'UPDATE daily_usage SET count = count + 1 WHERE identifier = ? AND date = ?',
    ).run(cacheKey, date);
  } else {
    db.prepare(
      `INSERT INTO daily_usage (identifier, identifier_type, date, count)
       VALUES (?, 'anonymous', ?, 1)`,
    ).run(cacheKey, date);
  }

  const currentCount = (usage?.count ?? 0) + 1;

  return {
    fortune,
    sajuSummary,
    cached: false,
    remainingFreeCount: config.dailyFreeLimit - currentCount,
  };
}
