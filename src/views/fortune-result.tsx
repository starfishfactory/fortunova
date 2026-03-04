import type { DetailedFortuneResult } from '@/fortune/types.js';

interface FortuneResultProps {
  fortune: {
    score: number;
    summary: string;
    detail: string;
    advice: string;
    luckyColor?: string;
    luckyNumber?: number;
    tier?: 'basic' | 'detailed';
    elementInsight?: string;
    dayTip?: string;
  };
  sajuSummary: {
    fourPillars: string;
  };
  cached: boolean;
  remainingFreeCount: number;
  formData?: Record<string, string>;
}

function ScoreBar({ score, label }: { score: number; label: string }) {
  return (
    <div class="mb-2">
      <div class="flex justify-between text-xs mb-1">
        <span class="text-gray-300">{label}</span>
        <span class="text-gold-400">{score}점</span>
      </div>
      <div class="w-full h-2 rounded-full" style="background: rgba(255,255,255,0.1);">
        <div
          class="h-2 rounded-full"
          style={`width: ${score}%; background: linear-gradient(90deg, var(--gold-600), var(--gold-400));`}
        />
      </div>
    </div>
  );
}

function RatingStars({ rating }: { rating: number }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span class={i <= rating ? 'text-gold-400' : 'text-gray-600'}>★</span>,
    );
  }
  return <span class="text-sm">{stars}</span>;
}

function ScoreGauge({ score }: { score: number }) {
  const color = score >= 80 ? '#e8c170' : score >= 60 ? '#d4a853' : score >= 40 ? '#b8923d' : '#8b6914';
  return (
    <div class="text-center mb-4">
      <div class="score-glow inline-block px-6 py-3 relative">
        <span class="text-5xl font-serif font-bold" style={`color: ${color};`}>{score}</span>
        <span class="text-lg text-gray-400 ml-1">점</span>
      </div>
    </div>
  );
}

export function FortuneResultPartial({
  fortune,
  sajuSummary,
  cached,
  remainingFreeCount,
  formData,
}: FortuneResultProps) {
  return (
    <div class="glass-card p-6 mt-4 fortune-reveal">
      {/* 점수 */}
      <ScoreGauge score={fortune.score} />

      {/* 한줄 요약 */}
      <h2 class="text-lg font-serif font-bold text-gray-100 mb-3 text-center">{fortune.summary}</h2>
      <hr class="divider-gold" />

      {/* 상세 설명 */}
      <div class="mb-4">
        <h3 class="text-sm font-medium text-gold-400 mb-2">📖 오늘의 운세</h3>
        <p class="text-gray-300 whitespace-pre-line leading-relaxed text-sm">{fortune.detail}</p>
      </div>

      {/* 오행 해설 (basic에서도 표시) */}
      {fortune.elementInsight && (
        <div class="mb-4 p-4 rounded-lg" style="background: rgba(212, 168, 83, 0.06); border: 1px solid rgba(212, 168, 83, 0.15);">
          <h3 class="text-sm font-medium text-gold-400 mb-1">🌿 오행 흐름</h3>
          <p class="text-sm text-gray-300">{fortune.elementInsight}</p>
        </div>
      )}

      {/* 조언 */}
      <div class="p-4 rounded-lg mb-4" style="background: rgba(212, 168, 83, 0.08); border: 1px solid rgba(212, 168, 83, 0.2);">
        <h3 class="text-sm font-medium text-gold-400 mb-1">💡 오늘의 조언</h3>
        <p class="text-sm text-gray-200 whitespace-pre-line">{fortune.advice}</p>
      </div>

      {/* 오늘의 팁 */}
      {fortune.dayTip && (
        <div class="mb-4 p-3 rounded-lg text-center" style="background: rgba(212, 168, 83, 0.04); border: 1px dashed rgba(212, 168, 83, 0.2);">
          <p class="text-sm text-gold-300">✨ {fortune.dayTip}</p>
        </div>
      )}

      {/* 행운 정보 */}
      {(fortune.luckyColor || fortune.luckyNumber) && (
        <div class="grid grid-cols-2 gap-2 mb-4">
          {fortune.luckyColor && (
            <div class="lucky-card">
              <span class="text-xs text-gray-500">행운의 색</span>
              <span class="text-sm text-gold-300">{fortune.luckyColor}</span>
            </div>
          )}
          {fortune.luckyNumber && (
            <div class="lucky-card">
              <span class="text-xs text-gray-500">행운의 숫자</span>
              <span class="text-sm text-gold-300">{fortune.luckyNumber}</span>
            </div>
          )}
        </div>
      )}

      {/* 사주 정보 */}
      <div class="text-sm text-gray-500 mb-4 p-3 rounded" style="background: rgba(255,255,255,0.02);">
        <p>🏛 사주: {sajuSummary.fourPillars}</p>
        {cached && <p class="mt-1">📋 캐시된 결과</p>}
        <p class="mt-1">🎫 오늘 남은 무료 횟수: {remainingFreeCount}회</p>
      </div>

      {/* 더 자세히 보기 버튼 (basic tier일 때만) */}
      {fortune.tier !== 'detailed' && formData && (
        <div class="mt-2">
          <div class="detail-promo p-4 rounded-lg mb-3">
            <p class="text-xs text-gray-400 mb-2">세부운(재물·건강·연애·직장) + 월간 흐름 + 대운 해석 + 궁합 팁까지</p>
            <form
              hx-post="/partials/fortune-detail"
              hx-target="#detail-result"
              hx-indicator="#detail-loading"
              class="text-center"
            >
              {Object.entries(formData).map(([key, value]) => (
                <input type="hidden" name={key} value={value} />
              ))}
              <button type="submit" class="btn-gold-outline detail-btn px-6 py-2.5 rounded-lg text-sm font-medium">
                <span class="detail-btn-badge">PREMIUM</span>
                🔮 더 자세히 보기
              </button>
            </form>
          </div>
          <div id="detail-loading" class="htmx-indicator mt-2">
            <div class="loading-container text-center py-4">
              <div class="orb-glow orb-glow--small mx-auto mb-2"></div>
              <p class="text-gold-400 text-sm animate-pulse">AI가 심층 분석 중입니다...</p>
            </div>
          </div>
          <div id="detail-result"></div>
        </div>
      )}
    </div>
  );
}

export function DetailedFortuneResultPartial({
  fortune,
}: {
  fortune: DetailedFortuneResult;
}) {
  const SUB_LABELS: Record<string, string> = {
    wealth: '💰 재물운',
    health: '💪 건강운',
    love: '💕 연애운',
    career: '💼 직장운',
  };

  return (
    <div class="detailed-result fortune-reveal">
      {/* PREMIUM 헤더 */}
      <div class="detailed-header p-4 text-center">
        <span class="detailed-badge">PREMIUM 분석</span>
        <h3 class="text-lg font-serif font-bold text-gold-400 mt-2">심층 운세 분석</h3>
        <p class="text-xs text-gray-400 mt-1">Sonnet AI 모델이 분석한 상세 결과입니다</p>
      </div>

      <div class="p-5">
        {/* 종합 점수 + 요약 */}
        <div class="text-center mb-4">
          <div class="score-glow inline-block px-6 py-3">
            <span class="text-4xl font-serif font-bold text-gold-400">{fortune.score}점</span>
          </div>
          <p class="text-sm text-gray-300 mt-2">{fortune.summary}</p>
        </div>

        {/* 상세 설명 */}
        <div class="mb-4">
          <p class="text-sm text-gray-300 whitespace-pre-line leading-relaxed">{fortune.detail}</p>
        </div>

        <hr class="divider-gold" />

        {/* 세부운 2x2 그리드 */}
        <h4 class="text-sm font-medium text-gold-400 mb-3">📊 세부 운세</h4>
        <div class="sub-fortune-grid mb-4">
          {Object.entries(fortune.subFortunes).map(([key, sub]) => (
            <div class="glass-card p-4">
              <h4 class="text-sm font-medium text-gold-300 mb-2">{SUB_LABELS[key] ?? key}</h4>
              <ScoreBar score={sub.score} label="" />
              <p class="text-xs text-gray-400 mt-1 leading-relaxed">{sub.description}</p>
            </div>
          ))}
        </div>

        {/* 오행 해설 */}
        {fortune.elementExplanation && (
          <div class="section-card section-card--gold mb-4">
            <h4 class="text-sm font-medium text-gold-400 mb-2">🌿 오행 해설</h4>
            <p class="text-sm text-gray-300 leading-relaxed">{fortune.elementExplanation}</p>
          </div>
        )}

        {/* 조언 */}
        <div class="section-card section-card--gold mb-4">
          <h4 class="text-sm font-medium text-gold-400 mb-2">💡 핵심 조언</h4>
          <p class="text-sm text-gray-200 whitespace-pre-line leading-relaxed">{fortune.advice}</p>
        </div>

        {/* 행운 정보 카드 */}
        {fortune.lucky && (
          <div class="mb-4">
            <h4 class="text-sm font-medium text-gold-400 mb-2">🍀 행운 정보</h4>
            <div class="grid grid-cols-2 gap-2">
              <div class="lucky-card">
                <span class="text-xs text-gray-500">행운의 색</span>
                <span class="text-sm text-gold-300 font-medium">{fortune.lucky.color}</span>
              </div>
              <div class="lucky-card">
                <span class="text-xs text-gray-500">행운의 숫자</span>
                <span class="text-sm text-gold-300 font-medium">{fortune.lucky.number}</span>
              </div>
              <div class="lucky-card">
                <span class="text-xs text-gray-500">행운의 방위</span>
                <span class="text-sm text-gold-300 font-medium">{fortune.lucky.direction}</span>
              </div>
              <div class="lucky-card">
                <span class="text-xs text-gray-500">행운의 시간</span>
                <span class="text-sm text-gold-300 font-medium">{fortune.lucky.timeSlot}</span>
              </div>
            </div>
          </div>
        )}

        {/* 주의사항 */}
        {fortune.cautions && (
          <div class="section-card section-card--warn mb-4">
            <h4 class="text-sm font-medium text-red-400 mb-2">⚠️ 주의사항</h4>
            <p class="text-sm text-gray-300 leading-relaxed">{fortune.cautions}</p>
          </div>
        )}

        {/* 월간 운세 흐름 */}
        {fortune.monthlyTrend && fortune.monthlyTrend.length > 0 && (
          <div class="mb-4">
            <h4 class="text-sm font-medium text-gold-400 mb-2">📅 3개월 운세 흐름</h4>
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
          <div class="section-card section-card--gold mb-4">
            <h4 class="text-sm font-medium text-gold-400 mb-2">💑 궁합/인간관계 팁</h4>
            <p class="text-sm text-gray-300 leading-relaxed">{fortune.compatibilityTip}</p>
          </div>
        )}

        {/* 대운 해석 */}
        {fortune.majorFateInterpretation && (
          <div class="section-card section-card--gold mb-4">
            <h4 class="text-sm font-medium text-gold-400 mb-2">🌟 대운 해석</h4>
            <p class="text-sm text-gray-300 leading-relaxed">{fortune.majorFateInterpretation}</p>
          </div>
        )}

        {/* 격언 카드 */}
        {fortune.proverb && (
          <div class="proverb-card mt-4">
            <p class="text-sm text-gold-300 italic text-center leading-relaxed">"{fortune.proverb}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
