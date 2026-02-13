interface PlanProps {
  id: string;
  name: string;
  price: number;
  period: string;
}

export function SubscriptionPage() {
  const plans: PlanProps[] = [
    { id: 'monthly', name: '월간 구독', price: 9900, period: '1개월' },
    { id: 'yearly', name: '연간 구독', price: 99000, period: '1년' },
  ];

  return (
    <div class="mt-4">
      <h2 class="text-lg font-bold text-gray-800 mb-4">구독 플랜</h2>
      <p class="text-sm text-gray-600 mb-6">
        구독하시면 운세 조회를 무제한으로 이용하실 수 있습니다.
      </p>
      <div class="space-y-4">
        {plans.map((plan) => (
          <div class="border rounded-xl p-4 hover:border-indigo-400 transition-colors">
            <div class="flex justify-between items-center mb-2">
              <h3 class="font-bold text-gray-800">{plan.name}</h3>
              <span class="text-lg font-bold text-indigo-600">
                {plan.price.toLocaleString()}원
              </span>
            </div>
            <p class="text-sm text-gray-500 mb-3">{plan.period} 이용권</p>
            <button
              hx-post="/partials/subscription/subscribe"
              hx-vals={JSON.stringify({ plan: plan.id })}
              hx-target="#subscription-result"
              hx-indicator="#sub-loading"
              class="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              구독하기
            </button>
          </div>
        ))}
      </div>
      <div id="sub-loading" class="htmx-indicator text-center py-4 text-indigo-600">
        처리 중...
      </div>
      <div id="subscription-result"></div>
    </div>
  );
}
