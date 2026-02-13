export function LimitExceededPartial() {
  return (
    <div class="bg-amber-50 border border-amber-200 rounded-xl p-6 mt-4">
      <div class="text-center mb-4">
        <span class="text-3xl">&#x1F510;</span>
      </div>
      <h3 class="text-lg font-bold text-amber-800 text-center mb-2">
        오늘의 무료 횟수를 모두 사용했습니다
      </h3>
      <p class="text-amber-700 text-sm text-center mb-4">
        일일 무료 3회 운세 조회를 모두 사용하셨습니다.
        구독하시면 무제한으로 이용하실 수 있습니다.
      </p>
      <div class="flex flex-col gap-2">
        <a
          href="/subscribe"
          class="block w-full bg-amber-600 text-white py-3 rounded-lg font-medium hover:bg-amber-700 transition-colors text-center"
        >
          구독 플랜 보기
        </a>
        <p class="text-center text-xs text-amber-500 mt-1">
          내일 자정에 무료 횟수가 초기화됩니다
        </p>
      </div>
    </div>
  );
}
