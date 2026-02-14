import type { MajorFatePeriod } from '@/engine/types/analysis.js';
import type { GanJi } from '@/engine/types/index.js';

interface ChartProps {
  majorFate: MajorFatePeriod[];
  yearlyFate: Array<{ year: number; ganJi: GanJi }>;
  currentAge: number;
}

const ELEMENT_COLORS: Record<string, string> = {
  '목': 'bg-green-100 text-green-800 border-green-300',
  '화': 'bg-red-100 text-red-800 border-red-300',
  '토': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  '금': 'bg-gray-100 text-gray-800 border-gray-300',
  '수': 'bg-blue-100 text-blue-800 border-blue-300',
};

function getElementColor(stem: string): string {
  const stemElementMap: Record<string, string> = {
    '갑': '목', '을': '목', '병': '화', '정': '화', '무': '토',
    '기': '토', '경': '금', '신': '금', '임': '수', '계': '수',
  };
  return ELEMENT_COLORS[stemElementMap[stem] || '토'] || '';
}

export function ChartPartial({ majorFate, yearlyFate, currentAge }: ChartProps) {
  return (
    <div class="bg-white rounded-xl shadow-lg p-6 mt-4">
      <h3 class="text-lg font-bold text-gray-800 mb-4">대운/세운 차트</h3>

      {/* 대운 타임라인 */}
      <div class="mb-6">
        <h4 class="text-sm font-medium text-gray-600 mb-3">대운 (10년 주기)</h4>
        <div class="flex overflow-x-auto gap-2 pb-2">
          {majorFate.map((period) => {
            const isActive = currentAge >= period.startAge && currentAge < period.endAge;
            const colorClass = getElementColor(period.ganJi.stem);
            return (
              <div
                class={`flex-shrink-0 border rounded-lg p-2 text-center min-w-16 ${colorClass} ${isActive ? 'ring-2 ring-indigo-500' : ''}`}
              >
                <div class="text-lg font-bold">
                  {period.ganJi.stem}{period.ganJi.branch}
                </div>
                <div class="text-xs mt-1">
                  {period.startAge}~{period.endAge}세
                </div>
                {isActive && (
                  <div class="text-xs font-medium text-indigo-600 mt-1">현재</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 세운 (최근 연도) */}
      <div>
        <h4 class="text-sm font-medium text-gray-600 mb-3">세운 (연간 운세)</h4>
        <div class="grid grid-cols-5 gap-2">
          {yearlyFate.map((yf) => {
            const isCurrentYear = yf.year === new Date().getFullYear();
            const colorClass = getElementColor(yf.ganJi.stem);
            return (
              <div
                class={`border rounded-lg p-2 text-center ${colorClass} ${isCurrentYear ? 'ring-2 ring-indigo-500' : ''}`}
              >
                <div class="text-sm font-bold">
                  {yf.ganJi.stem}{yf.ganJi.branch}
                </div>
                <div class="text-xs mt-1">{yf.year}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
