import type { Subscription } from '@/services/subscription.js';

interface MypageProps {
  email: string;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  subscription: Subscription | null;
}

export function MypagePage({ email, birthYear, birthMonth, birthDay, subscription }: MypageProps) {
  const isActive = subscription?.status === 'active' && new Date(subscription.endDate) > new Date();

  return (
    <div class="mt-6">
      <div class="text-center mb-6">
        <h2 class="text-2xl font-serif font-bold text-gold-400 mb-2">마이페이지</h2>
        <hr class="divider-gold" />
      </div>

      {/* 계정 정보 */}
      <div class="glass-card p-6 mb-4">
        <h3 class="text-lg font-medium text-gold-300 mb-4">계정 정보</h3>
        <div class="space-y-3 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-400">이메일</span>
            <span class="text-gray-200">{email}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">생년월일</span>
            <span class="text-gray-200">{birthYear}년 {birthMonth}월 {birthDay}일</span>
          </div>
        </div>
      </div>

      {/* 구독 상태 */}
      <div class="glass-card p-6 mb-4">
        <h3 class="text-lg font-medium text-gold-300 mb-4">구독 상태</h3>
        {isActive ? (
          <div class="space-y-3">
            <div class="flex items-center gap-2">
              <span class="inline-block w-2 h-2 rounded-full bg-green-400"></span>
              <span class="text-green-400 font-medium">활성 구독</span>
            </div>
            <div class="text-sm space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-400">플랜</span>
                <span class="text-gray-200">{subscription!.plan === 'monthly' ? '월간 구독' : '연간 구독'}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">만료일</span>
                <span class="text-gray-200">{new Date(subscription!.endDate).toLocaleDateString('ko-KR')}</span>
              </div>
            </div>
            <button
              hx-post="/api/v1/subscription/cancel"
              hx-vals={JSON.stringify({ subscriptionId: subscription!.id })}
              hx-confirm="정말 구독을 취소하시겠습니까?"
              hx-target="#subscription-result"
              class="mt-3 text-sm text-red-400 hover:text-red-300 transition-colors underline"
            >
              구독 취소
            </button>
            <div id="subscription-result"></div>
          </div>
        ) : (
          <div class="space-y-3">
            <div class="flex items-center gap-2">
              <span class="inline-block w-2 h-2 rounded-full bg-gray-500"></span>
              <span class="text-gray-400">구독 없음</span>
            </div>
            <p class="text-sm text-gray-400">
              구독하시면 일일 무료 제한 없이 무제한으로 운세를 확인할 수 있습니다.
            </p>
            <a
              href="/subscribe"
              class="btn-gold inline-block px-6 py-2 rounded-lg font-medium text-sm text-center"
            >
              구독하기
            </a>
          </div>
        )}
      </div>

      {/* 로그아웃 */}
      <div class="text-center mt-6">
        <button
          hx-post="/api/auth/logout"
          hx-target="body"
          class="text-sm text-gray-400 hover:text-gray-300 transition-colors underline"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}
