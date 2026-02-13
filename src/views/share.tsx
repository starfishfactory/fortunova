import type { FortuneResult } from '@/fortune/types.js';

interface SharePageProps {
  fortune: FortuneResult;
  sajuSummary: {
    fourPillars: string;
  };
  category: string;
  shareId: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  daily: '오늘의 운세',
  love: '연애운',
  career: '직장/사업운',
  health: '건강운',
  wealth: '재물운',
};

export function SharePage({ fortune, sajuSummary, category, shareId }: SharePageProps) {
  return (
    <html lang="ko">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Fortunova - {CATEGORY_LABELS[category] || '운세'} 결과</title>
        <meta property="og:title" content={`Fortunova - ${CATEGORY_LABELS[category] || '운세'} 결과`} />
        <meta property="og:description" content={fortune.summary} />
        <meta property="og:type" content="website" />
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
        <header class="bg-indigo-600 text-white p-4 shadow-lg">
          <div class="max-w-md mx-auto">
            <a href="/">
              <h1 class="text-xl font-bold">Fortunova</h1>
              <p class="text-sm text-indigo-200">AI 사주/명리 운세</p>
            </a>
          </div>
        </header>
        <main class="max-w-md mx-auto p-4">
          <div class="bg-white rounded-xl shadow-lg p-6 mt-4">
            <div class="text-center mb-2">
              <span class="text-xs text-indigo-500 font-medium">
                {CATEGORY_LABELS[category] || '운세'}
              </span>
            </div>
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
            </div>
          </div>
          <div class="text-center mt-4">
            <a
              href="/"
              class="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              나도 운세 보기
            </a>
          </div>
        </main>
        <footer class="text-center text-sm text-gray-400 p-4 mt-8">
          &copy; 2026 Fortunova
        </footer>
      </body>
    </html>
  );
}
