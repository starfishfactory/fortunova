import type { SubscriptionPlan } from '@/services/subscription.js';

interface SubscribeProps {
  plans: SubscriptionPlan[];
  isAuthenticated: boolean;
}

export function SubscribePage({ plans, isAuthenticated }: SubscribeProps) {
  const monthly = plans.find((p) => p.id === 'monthly')!;
  const yearly = plans.find((p) => p.id === 'yearly')!;
  const monthlySaving = Math.round((1 - yearly.price / (monthly.price * 12)) * 100);

  return (
    <div class="mt-6">
      <div class="text-center mb-6">
        <h2 class="text-2xl font-serif font-bold text-gold-400 mb-2">구독 안내</h2>
        <p class="text-sm text-gray-400">무제한 운세 감정을 즐겨보세요</p>
        <hr class="divider-gold mt-3" />
      </div>

      {/* 무료 vs 구독 비교 */}
      <div class="glass-card p-6 mb-4">
        <h3 class="text-base font-medium text-gold-300 mb-3">무료 회원</h3>
        <ul class="text-sm text-gray-400 space-y-2">
          <li>- 일일 3회 무료 감정</li>
          <li>- 기본 운세 분석</li>
        </ul>
      </div>

      {/* 플랜 카드들 */}
      <div class="space-y-4">
        {/* 월간 */}
        <div class="glass-card p-6 border-gold-600/30">
          <div class="flex justify-between items-center mb-3">
            <h3 class="text-lg font-medium text-gold-300">{monthly.name}</h3>
            <div class="text-right">
              <span class="text-2xl font-bold text-gold-400">{monthly.price.toLocaleString()}</span>
              <span class="text-sm text-gray-400">원/월</span>
            </div>
          </div>
          <ul class="text-sm text-gray-300 space-y-2 mb-4">
            <li>- 무제한 운세 감정</li>
            <li>- 상세 사주 분석</li>
            <li>- 일간/월간/연간 운세</li>
          </ul>
          {isAuthenticated ? (
            <button
              hx-post="/api/v1/subscription/subscribe"
              hx-vals={JSON.stringify({ planId: 'monthly', provider: 'toss' })}
              hx-target="#subscribe-result"
              hx-indicator="#subscribe-loading"
              class="btn-gold w-full py-3 rounded-lg font-medium text-base"
            >
              월간 구독하기
            </button>
          ) : (
            <a href="/login" class="btn-gold block w-full py-3 rounded-lg font-medium text-base text-center">
              로그인 후 구독하기
            </a>
          )}
        </div>

        {/* 연간 */}
        <div class="glass-card p-6 border-gold-400/50 relative">
          <div class="absolute -top-3 right-4 bg-gold-500 text-navy-900 text-xs font-bold px-3 py-1 rounded-full">
            {monthlySaving}% 할인
          </div>
          <div class="flex justify-between items-center mb-3">
            <h3 class="text-lg font-medium text-gold-300">{yearly.name}</h3>
            <div class="text-right">
              <span class="text-2xl font-bold text-gold-400">{yearly.price.toLocaleString()}</span>
              <span class="text-sm text-gray-400">원/년</span>
            </div>
          </div>
          <p class="text-xs text-gray-400 mb-3">
            월 {Math.round(yearly.price / 12).toLocaleString()}원 (월간 대비 {monthlySaving}% 절약)
          </p>
          <ul class="text-sm text-gray-300 space-y-2 mb-4">
            <li>- 무제한 운세 감정</li>
            <li>- 상세 사주 분석</li>
            <li>- 일간/월간/연간 운세</li>
          </ul>
          {isAuthenticated ? (
            <button
              hx-post="/api/v1/subscription/subscribe"
              hx-vals={JSON.stringify({ planId: 'yearly', provider: 'toss' })}
              hx-target="#subscribe-result"
              hx-indicator="#subscribe-loading"
              class="btn-gold w-full py-3 rounded-lg font-medium text-base"
            >
              연간 구독하기
            </button>
          ) : (
            <a href="/login" class="btn-gold block w-full py-3 rounded-lg font-medium text-base text-center">
              로그인 후 구독하기
            </a>
          )}
        </div>
      </div>

      <div id="subscribe-loading" class="htmx-indicator text-center py-4">
        <p class="text-gold-400 animate-pulse">결제 처리 중...</p>
      </div>
      <div id="subscribe-result"></div>
    </div>
  );
}
