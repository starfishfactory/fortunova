import type { BirthInput } from '@/engine/types/index.js';
import type { FortuneCategory, FortuneResult } from '@/fortune/types.js';
import { fortuneRegistry } from '@/fortune/registry.js';
import { callClaude } from '@/services/llm.js';
import { getDatabase } from '@/db/connection.js';
import { config } from '@/config.js';
import { buildChunkPrompts, mergeChunkResults } from '@/fortune/systems/saju-system.js';
import type { ChunkType } from '@/fortune/systems/saju-system.js';

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

export type ChunkProgressEvent = {
  type: 'progress';
  chunk: ChunkType;
  elapsed: number;
} | {
  type: 'cached';
} | {
  type: 'done';
  result: GetFortuneResult;
} | {
  type: 'error';
  message: string;
};

/**
 * 스트리밍 운세: 청크 완료 시 콜백 호출
 */
export async function getFortuneStream(
  input: BirthInput,
  category: FortuneCategory,
  systemId: string,
  identifier: string,
  identifierType: 'user' | 'anonymous',
  onEvent: (event: ChunkProgressEvent) => void,
): Promise<void> {
  try {
    const system = fortuneRegistry.get(systemId);
    if (!system) {
      onEvent({ type: 'error', message: '지원하지 않는 운세 시스템' });
      return;
    }

    const db = getDatabase();
    const date = getTodayDate();
    const cacheKey = buildCacheKey(input, date, category, systemId);

    // 캐시 조회
    const cached = db.prepare(
      'SELECT fortune, score, saju_data FROM fortune_cache WHERE cache_key = ?',
    ).get(cacheKey) as { fortune: string; score: number; saju_data: string } | undefined;

    if (cached) {
      const fortune: FortuneResult = JSON.parse(cached.fortune);
      const sajuSummary = JSON.parse(cached.saju_data);
      const usage = db.prepare(
        'SELECT count FROM daily_usage WHERE identifier = ? AND date = ?',
      ).get(identifier, date) as { count: number } | undefined;
      onEvent({ type: 'cached' });
      onEvent({ type: 'done', result: { fortune, sajuSummary, cached: true, remainingFreeCount: config.dailyFreeLimit - (usage?.count ?? 0) } });
      return;
    }

    // 분석
    const analysis = await system.analyze(input as unknown as Record<string, unknown>);
    const chunkPrompts = buildChunkPrompts(analysis, category);
    const chunkTypes: ChunkType[] = ['core', 'sub', 'meta'];
    const startTime = Date.now();

    // 3청크 병렬 — 각 완료 시 이벤트 발행
    const chunkResults: { type: ChunkType; response: string | null }[] = [];
    const promises = chunkTypes.map((ct) =>
      callClaude(chunkPrompts[ct])
        .then((resp) => {
          const elapsed = Date.now() - startTime;
          chunkResults.push({ type: ct, response: resp });
          onEvent({ type: 'progress', chunk: ct, elapsed });
        })
        .catch((err) => {
          console.error(`[fortune-stream] ${ct} chunk failed:`, err);
          chunkResults.push({ type: ct, response: null });
          onEvent({ type: 'progress', chunk: ct, elapsed: Date.now() - startTime });
        }),
    );
    await Promise.all(promises);

    // core 필수
    const coreResult = chunkResults.find((r) => r.type === 'core');
    if (!coreResult?.response) {
      onEvent({ type: 'error', message: 'LLM_UNAVAILABLE' });
      return;
    }

    const fortune = mergeChunkResults(
      chunkTypes.map((ct) => chunkResults.find((r) => r.type === ct) ?? { type: ct, response: null }),
    );

    // 사주 요약
    const data = analysis.data as Record<string, unknown>;
    const fp = data.fourPillars as Record<string, Record<string, string>> | undefined;
    const fourPillarsStr = fp
      ? `${fp.year?.stem ?? ''}${fp.year?.branch ?? ''} ${fp.month?.stem ?? ''}${fp.month?.branch ?? ''} ${fp.day?.stem ?? ''}${fp.day?.branch ?? ''} ${fp.hour?.stem ?? ''}${fp.hour?.branch ?? ''}`
      : '';
    const sajuSummary = {
      fourPillars: fourPillarsStr.trim(),
      dayMasterStrength: (data.dayMasterStrength as string) ?? '',
      todayElement: (data.usefulGod as string) ?? '',
    };

    // 캐시 저장
    const isError = fortune.summary.includes('파싱에 실패') || fortune.advice === '재시도를 권장합니다.';
    if (!isError) {
      const expiresAt = `${date}T23:59:59`;
      db.prepare(
        `INSERT OR REPLACE INTO fortune_cache (cache_key, date, category, system_id, saju_data, fortune, score, expires_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(cacheKey, date, category, systemId, JSON.stringify(sajuSummary), JSON.stringify(fortune), fortune.score, expiresAt, new Date().toISOString());
    }

    // 사용량 증가
    const usage = db.prepare(
      'SELECT count FROM daily_usage WHERE identifier = ? AND date = ?',
    ).get(identifier, date) as { count: number } | undefined;
    if (usage) {
      db.prepare('UPDATE daily_usage SET count = count + 1 WHERE identifier = ? AND date = ?').run(identifier, date);
    } else {
      db.prepare('INSERT INTO daily_usage (identifier, identifier_type, date, count) VALUES (?, ?, ?, 1)').run(identifier, identifierType, date);
    }
    const currentCount = (usage?.count ?? 0) + 1;

    onEvent({ type: 'done', result: { fortune, sajuSummary, cached: false, remainingFreeCount: config.dailyFreeLimit - currentCount } });
  } catch (e) {
    console.error('[fortune-stream] Error:', (e as Error).message);
    const msg = (e as Error).message;
    if (msg === 'DAILY_LIMIT_EXCEEDED' || msg.includes('일일')) {
      onEvent({ type: 'error', message: 'DAILY_LIMIT_EXCEEDED' });
    } else {
      onEvent({ type: 'error', message: 'LLM_UNAVAILABLE' });
    }
  }
}

/**
 * 운세 오케스트레이션: 캐시 → 분석 → LLM → 저장
 */
export async function getFortune(
  input: BirthInput,
  category: FortuneCategory,
  systemId: string,
  identifier: string,
  identifierType: 'user' | 'anonymous',
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
    ).get(identifier, date) as { count: number } | undefined;

    return {
      fortune,
      sajuSummary,
      cached: true,
      remainingFreeCount: config.dailyFreeLimit - (usage?.count ?? 0),
    };
  }

  // 3. 분석 → 3청크 병렬 LLM → 머지
  const analysis = await system.analyze(input as unknown as Record<string, unknown>);
  const chunkPrompts = buildChunkPrompts(analysis, category);
  const chunkTypes: ChunkType[] = ['core', 'sub', 'meta'];

  const results = await Promise.allSettled(
    chunkTypes.map((type) => callClaude(chunkPrompts[type]).then((resp) => ({ type, response: resp }))),
  );

  const chunks: { type: ChunkType; response: string | null }[] = chunkTypes.map((type, i) => {
    const r = results[i];
    if (r.status === 'fulfilled') return r.value;
    console.error(`[fortune] ${type} chunk failed:`, r.reason);
    return { type, response: null };
  });

  // core 실패 시 전체 에러
  if (!chunks[0].response) {
    throw new Error('LLM_UNAVAILABLE');
  }

  const fortune = mergeChunkResults(chunks);

  const data = analysis.data as Record<string, unknown>;
  const fp = data.fourPillars as Record<string, Record<string, string>> | undefined;
  const fourPillarsStr = fp
    ? `${fp.year?.stem ?? ''}${fp.year?.branch ?? ''} ${fp.month?.stem ?? ''}${fp.month?.branch ?? ''} ${fp.day?.stem ?? ''}${fp.day?.branch ?? ''} ${fp.hour?.stem ?? ''}${fp.hour?.branch ?? ''}`
    : '';
  const sajuSummary = {
    fourPillars: fourPillarsStr.trim(),
    dayMasterStrength: (data.dayMasterStrength as string) ?? '',
    todayElement: (data.usefulGod as string) ?? '',
  };

  // 4. 캐시 저장 (파싱 실패 응답은 캐시하지 않음)
  const isError = fortune.summary.includes('파싱에 실패') || fortune.advice === '재시도를 권장합니다.';
  if (!isError) {
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
  }

  // 5. 사용량 증가
  const usage = db.prepare(
    'SELECT count FROM daily_usage WHERE identifier = ? AND date = ?',
  ).get(identifier, date) as { count: number } | undefined;

  if (usage) {
    db.prepare(
      'UPDATE daily_usage SET count = count + 1 WHERE identifier = ? AND date = ?',
    ).run(identifier, date);
  } else {
    db.prepare(
      `INSERT INTO daily_usage (identifier, identifier_type, date, count)
       VALUES (?, ?, ?, 1)`,
    ).run(identifier, identifierType, date);
  }

  const currentCount = (usage?.count ?? 0) + 1;

  return {
    fortune,
    sajuSummary,
    cached: false,
    remainingFreeCount: config.dailyFreeLimit - currentCount,
  };
}
