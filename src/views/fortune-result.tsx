interface FortuneResultProps {
  fortune: {
    score: number;
    summary: string;
    detail: string;
    advice: string;
    luckyColor?: string;
    luckyNumber?: number;
  };
  sajuSummary: {
    fourPillars: string;
  };
  cached: boolean;
  remainingFreeCount: number;
}

export function FortuneResultPartial({
  fortune,
  sajuSummary,
  cached,
  remainingFreeCount,
}: FortuneResultProps) {
  return (
    <div class="glass-card p-6 mt-4 fortune-reveal">
      <div class="text-center mb-4">
        <div class="score-glow inline-block px-6 py-3">
          <span class="text-4xl font-serif font-bold text-gold-400">{fortune.score}점</span>
        </div>
      </div>
      <h2 class="text-lg font-bold text-gray-100 mb-2">{fortune.summary}</h2>
      <p class="text-gray-300 whitespace-pre-line leading-relaxed">{fortune.detail}</p>
      <hr class="divider-gold" />
      <div class="p-4 rounded-lg" style="background: rgba(212, 168, 83, 0.08); border: 1px solid rgba(212, 168, 83, 0.2);">
        <p class="text-gray-200">{fortune.advice}</p>
        {fortune.luckyColor && <p class="text-gold-300 text-sm mt-1">행운의 색: {fortune.luckyColor}</p>}
        {fortune.luckyNumber && <p class="text-gold-300 text-sm mt-1">행운의 숫자: {fortune.luckyNumber}</p>}
      </div>
      <div class="mt-4 text-sm text-gray-500">
        <p>사주: {sajuSummary.fourPillars}</p>
        {cached && <p>캐시된 결과</p>}
        <p>오늘 남은 무료 횟수: {remainingFreeCount}회</p>
      </div>
      <div class="mt-4 text-center">
        <button id="reopen-form" class="text-sm text-gold-400 hover:text-gold-300 underline cursor-pointer">
          다시 입력하기
        </button>
      </div>
    </div>
  );
}
