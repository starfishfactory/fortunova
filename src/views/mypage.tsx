interface MypageProps {
  user: {
    email: string;
    birthYear: number;
    birthMonth: number;
    birthDay: number;
    gender: string;
  };
  subscription: {
    plan: string;
    status: string;
    endDate: string;
  } | null;
}

export function MypagePage({ user, subscription }: MypageProps) {
  return (
    <div class="mt-4">
      <h2 class="text-lg font-bold text-gray-800 mb-4">마이페이지</h2>

      <div class="bg-white rounded-xl shadow p-4 mb-4">
        <h3 class="font-medium text-gray-700 mb-2">내 정보</h3>
        <div class="text-sm text-gray-600 space-y-1">
          <p>이메일: {user.email}</p>
          <p>생년월일: {user.birthYear}년 {user.birthMonth}월 {user.birthDay}일</p>
          <p>성별: {user.gender === 'M' ? '남성' : '여성'}</p>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow p-4 mb-4">
        <h3 class="font-medium text-gray-700 mb-2">구독 상태</h3>
        {subscription ? (
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                {subscription.status === 'active' ? '활성' : subscription.status}
              </span>
              <span class="text-sm text-gray-600">
                {subscription.plan === 'monthly' ? '월간' : '연간'} 구독
              </span>
            </div>
            <p class="text-xs text-gray-500 mb-3">
              만료일: {subscription.endDate}
            </p>
            <button
              hx-post="/partials/subscription/cancel"
              hx-target="#subscription-action"
              hx-confirm="정말 구독을 취소하시겠습니까?"
              class="text-sm text-red-600 hover:text-red-800 underline"
            >
              구독 취소
            </button>
          </div>
        ) : (
          <div>
            <p class="text-sm text-gray-500 mb-3">활성 구독이 없습니다.</p>
            <a
              href="/subscribe"
              class="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              구독하기
            </a>
          </div>
        )}
        <div id="subscription-action"></div>
      </div>

      <div class="text-center mt-6">
        <button
          hx-post="/api/auth/logout"
          hx-target="body"
          class="text-sm text-gray-500 hover:text-gray-700 underline"
          onclick="window.location.href='/'"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}
