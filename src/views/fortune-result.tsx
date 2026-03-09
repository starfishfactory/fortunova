import type { FortuneResult, FortuneCategory } from '@/fortune/types.js';

const CATEGORY_HEADERS: Record<FortuneCategory, { icon: string; label: string }> = {
  daily: { icon: '📖', label: '오늘의 운세' },
  love: { icon: '💕', label: '애정운' },
  career: { icon: '💼', label: '직장/사업운' },
  health: { icon: '💪', label: '건강운' },
  wealth: { icon: '💰', label: '재물운' },
};

interface FortuneResultProps {
  fortune: FortuneResult;
  sajuSummary: { fourPillars: string };
  cached: boolean;
  remainingFreeCount: number;
  category?: FortuneCategory;
}

function ScoreBar({ score, label }: { score: number; label: string }) {
  return (
    <div class="mb-2">
      <div class="flex justify-between text-xs mb-1">
        <span class="text-gray-300">{label}</span>
        <span class="text-gold-400">{score}점</span>
      </div>
      <div class="w-full h-2 rounded-full" style="background: rgba(255,255,255,0.1);">
        <div class="h-2 rounded-full" style={`width: ${score}%; background: linear-gradient(90deg, var(--gold-600), var(--gold-400));`} />
      </div>
    </div>
  );
}

function RatingStars({ rating }: { rating: number }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(<span class={i <= rating ? 'text-gold-400' : 'text-gray-600'}>★</span>);
  }
  return <span class="text-sm">{stars}</span>;
}

export function FortuneResultPartial({ fortune, sajuSummary, cached, remainingFreeCount, category = 'daily' }: FortuneResultProps) {
  const SUB_LABELS: Record<string, string> = { wealth: '💰 재물운', health: '💪 건강운', love: '💕 연애운', career: '💼 직장운' };
  const scoreColor = fortune.score >= 80 ? '#e8c170' : fortune.score >= 60 ? '#d4a853' : fortune.score >= 40 ? '#b8923d' : '#8b6914';
  const header = CATEGORY_HEADERS[category] ?? CATEGORY_HEADERS.daily;

  return (
    <div class="fortune-reveal">
      {/* 종합 점수 + 요약 */}
      <div class="glass-card p-6 mt-4">
        {/* 카테고리 뱃지 */}
        <div class="text-center mb-3">
          <span class="inline-block text-xs px-3 py-1 rounded-full" style="background: rgba(212, 168, 83, 0.1); border: 1px solid rgba(212, 168, 83, 0.2); color: var(--gold-300);">
            {header.icon} {header.label}
          </span>
        </div>
        <div class="text-center mb-4">
          <div class="score-glow inline-block px-6 py-3">
            <span class="text-5xl font-serif font-bold" style={`color: ${scoreColor};`}>{fortune.score}</span>
            <span class="text-lg text-gray-400 ml-1">점</span>
          </div>
        </div>
        <h2 class="text-lg font-serif font-bold text-gray-100 mb-3 text-center">{fortune.summary}</h2>
        <hr class="divider-gold" />

        {/* 상세 설명 */}
        <div class="mb-4">
          <h3 class="text-sm font-medium text-gold-400 mb-2">{header.icon} {header.label}</h3>
          <p class="text-gray-300 whitespace-pre-line leading-relaxed text-sm">{fortune.detail}</p>
        </div>

        {/* 오행 흐름 */}
        {fortune.elementInsight && (
          <div class="section-card section-card--gold mb-4">
            <h3 class="text-sm font-medium text-gold-400 mb-1">🌿 오행 흐름</h3>
            <p class="text-sm text-gray-300">{fortune.elementInsight}</p>
          </div>
        )}

        {/* 오늘의 조언 */}
        <div class="section-card section-card--gold mb-4">
          <h3 class="text-sm font-medium text-gold-400 mb-1">💡 오늘의 조언</h3>
          <p class="text-sm text-gray-200 whitespace-pre-line">{fortune.advice}</p>
        </div>

        {/* 오늘의 팁 */}
        {fortune.dayTip && (
          <div class="mb-4 p-3 rounded-lg text-center" style="background: rgba(212, 168, 83, 0.04); border: 1px dashed rgba(212, 168, 83, 0.2);">
            <p class="text-sm text-gold-300">✨ {fortune.dayTip}</p>
          </div>
        )}
      </div>

      {/* 세부운 2x2 그리드 */}
      {fortune.subFortunes && (
        <div class="mt-4">
          <h4 class="text-sm font-medium text-gold-400 mb-3 px-1">📊 세부 운세</h4>
          <div class="sub-fortune-grid">
            {Object.entries(fortune.subFortunes).map(([key, sub]) => (
              <div class="glass-card p-4">
                <h4 class="text-sm font-medium text-gold-300 mb-2">{SUB_LABELS[key] ?? key}</h4>
                <ScoreBar score={sub.score} label="" />
                <p class="text-xs text-gray-400 mt-1 leading-relaxed">{sub.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 오행 상세 해설 */}
      {fortune.elementExplanation && (
        <div class="glass-card p-5 mt-4">
          <h4 class="text-sm font-medium text-gold-400 mb-2">🌿 오행 해설</h4>
          <p class="text-sm text-gray-300 leading-relaxed">{fortune.elementExplanation}</p>
        </div>
      )}

      {/* 행운 정보 */}
      {fortune.lucky && (
        <div class="mt-4">
          <h4 class="text-sm font-medium text-gold-400 mb-2 px-1">🍀 행운 정보</h4>
          <div class="grid grid-cols-2 gap-2">
            <div class="lucky-card"><span class="text-xs text-gray-500">행운의 색</span><span class="text-sm text-gold-300 font-medium">{fortune.lucky.color}</span></div>
            <div class="lucky-card"><span class="text-xs text-gray-500">행운의 숫자</span><span class="text-sm text-gold-300 font-medium">{fortune.lucky.number}</span></div>
            <div class="lucky-card"><span class="text-xs text-gray-500">행운의 방위</span><span class="text-sm text-gold-300 font-medium">{fortune.lucky.direction}</span></div>
            <div class="lucky-card"><span class="text-xs text-gray-500">행운의 시간</span><span class="text-sm text-gold-300 font-medium">{fortune.lucky.timeSlot}</span></div>
          </div>
        </div>
      )}

      {/* 주의사항 */}
      {fortune.cautions && (
        <div class="glass-card p-5 mt-4" style="border-color: rgba(239, 68, 68, 0.2);">
          <h4 class="text-sm font-medium text-red-400 mb-2">⚠️ 주의사항</h4>
          <p class="text-sm text-gray-300 leading-relaxed">{fortune.cautions}</p>
        </div>
      )}

      {/* 월간 운세 흐름 */}
      {fortune.monthlyTrend && fortune.monthlyTrend.length > 0 && (
        <div class="glass-card p-5 mt-4">
          <h4 class="text-sm font-medium text-gold-400 mb-3">📅 3개월 운세 흐름</h4>
          <div class="space-y-2">
            {fortune.monthlyTrend.map((item) => (
              <div class="flex items-center gap-3 p-3 rounded-lg" style="background: rgba(255,255,255,0.03);">
                <span class="text-xs text-gray-500 w-16 shrink-0 font-medium">{item.month}</span>
                <span class="text-sm text-gray-300 flex-1">{item.trend}</span>
                <RatingStars rating={item.rating} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 궁합 팁 */}
      {fortune.compatibilityTip && (
        <div class="glass-card p-5 mt-4">
          <h4 class="text-sm font-medium text-gold-400 mb-2">💑 궁합/인간관계 팁</h4>
          <p class="text-sm text-gray-300 leading-relaxed">{fortune.compatibilityTip}</p>
        </div>
      )}

      {/* 대운 해석 */}
      {fortune.majorFateInterpretation && (
        <div class="glass-card p-5 mt-4">
          <h4 class="text-sm font-medium text-gold-400 mb-2">🌟 대운 해석</h4>
          <p class="text-sm text-gray-300 leading-relaxed">{fortune.majorFateInterpretation}</p>
        </div>
      )}

      {/* 격언 */}
      {fortune.proverb && (
        <div class="proverb-card mt-4">
          <p class="text-sm text-gold-300 italic text-center leading-relaxed">"{fortune.proverb}"</p>
        </div>
      )}

      {/* 공유하기 */}
      <div class="mt-4 text-center">
        <button
          id="share-btn"
          type="button"
          class="btn-gold-outline px-5 py-2.5 text-sm"
          data-score={String(fortune.score)}
          data-summary={fortune.summary}
          data-advice={fortune.advice}
          data-lucky-color={fortune.lucky?.color ?? ''}
          data-lucky-number={fortune.lucky?.number != null ? String(fortune.lucky.number) : ''}
          data-proverb={fortune.proverb ?? ''}
        >
          📤 공유하기
        </button>
        <p id="share-feedback" class="text-xs text-gold-300 mt-2" style="display:none;"></p>
      </div>

      {/* 다른 카테고리 유도 */}
      {remainingFreeCount > 0 && (
        <div class="mt-4">
          <p class="text-xs text-gray-500 mb-2 text-center">다른 운세도 확인해보세요</p>
          <div class="flex flex-wrap justify-center gap-2">
            {(Object.entries(CATEGORY_HEADERS) as [FortuneCategory, { icon: string; label: string }][])
              .filter(([key]) => key !== category)
              .map(([key, h]) => (
                <button
                  type="button"
                  class="category-chip text-xs px-3 py-1.5 rounded-full cursor-pointer"
                  style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); color: var(--text-secondary);"
                  data-category={key}
                >
                  {h.icon} {h.label}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* 사주 정보 + 메타 */}
      <div class="text-sm text-gray-500 mt-4 p-3 rounded" style="background: rgba(255,255,255,0.02);">
        <p>🏛 사주: {sajuSummary.fourPillars}</p>
        {cached && <p class="mt-1">📋 캐시된 결과</p>}
        <p class="mt-1">
          🎫 오늘 남은 무료 횟수: <span class={remainingFreeCount <= 1 ? 'text-red-400 font-semibold' : 'text-gold-400 font-semibold'}>{remainingFreeCount}회</span>
        </p>
      </div>
    </div>
  );
}
