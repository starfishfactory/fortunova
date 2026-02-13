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
    <div class="bg-white rounded-xl shadow-lg p-6 mt-4">
      <div class="text-center mb-4">
        <div class="text-4xl font-bold text-indigo-600">{fortune.score}점</div>
      </div>
      <h2 class="text-lg font-bold mb-2">{fortune.summary}</h2>
      <p class="text-gray-700 whitespace-pre-line">{fortune.detail}</p>
      <div class="mt-4 p-3 bg-indigo-50 rounded-lg">
        <p>{fortune.advice}</p>
        {fortune.luckyColor && <p>행운의 색: {fortune.luckyColor}</p>}
        {fortune.luckyNumber && <p>행운의 숫자: {fortune.luckyNumber}</p>}
      </div>
      <div class="mt-4 text-sm text-gray-500">
        <p>사주: {sajuSummary.fourPillars}</p>
        {cached && <p>캐시된 결과</p>}
        <p>오늘 남은 무료 횟수: {remainingFreeCount}회</p>
      </div>

      {/* 대운/세운 차트 버튼 */}
      <div class="mt-4 flex gap-2">
        <button
          hx-post="/partials/chart"
          hx-target="#chart-area"
          hx-indicator="#chart-loading"
          hx-include="[name='year'],[name='month'],[name='day'],[name='hour'],[name='gender'],[name='calendarType'],[name='isLeapMonth']"
          class="flex-1 bg-purple-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
        >
          대운/세운 차트
        </button>
        <button
          id="share-btn"
          class="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          onclick={`
            fetch('/api/share', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                fortune: ${JSON.stringify(fortune)},
                sajuSummary: ${JSON.stringify(sajuSummary)},
                category: 'daily'
              })
            }).then(r => r.json()).then(d => {
              if (d.shareUrl) {
                const url = location.origin + d.shareUrl;
                navigator.clipboard.writeText(url).then(() => {
                  document.getElementById('share-btn').textContent = '링크 복사됨!';
                }).catch(() => {
                  prompt('공유 링크:', url);
                });
              }
            });
          `}
        >
          공유하기
        </button>
      </div>
      <div id="chart-loading" class="htmx-indicator text-center py-2 text-purple-600 text-sm">
        차트 로딩 중...
      </div>
      <div id="chart-area"></div>
    </div>
  );
}
