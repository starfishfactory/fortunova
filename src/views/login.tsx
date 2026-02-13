export function LoginPage() {
  return (
    <div class="mt-4">
      <h2 class="text-lg font-bold text-gray-800 mb-4">로그인</h2>
      <form
        hx-post="/partials/auth/login"
        hx-target="#auth-result"
        hx-indicator="#auth-loading"
        class="space-y-4"
      >
        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">이메일</label>
          <input
            type="email"
            name="email"
            required
            class="border rounded-lg p-2 text-sm w-full"
            placeholder="email@example.com"
          />
        </div>
        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">비밀번호</label>
          <input
            type="password"
            name="password"
            required
            class="border rounded-lg p-2 text-sm w-full"
            placeholder="8자 이상"
          />
        </div>
        <button
          type="submit"
          class="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          로그인
        </button>
      </form>
      <div id="auth-loading" class="htmx-indicator text-center py-4 text-indigo-600">
        로그인 중...
      </div>
      <div id="auth-result"></div>
      <p class="text-center text-sm text-gray-500 mt-4">
        계정이 없으신가요? <a href="/register" class="text-indigo-600 hover:underline">회원가입</a>
      </p>
    </div>
  );
}
