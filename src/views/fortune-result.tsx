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
    </div>
  );
}
