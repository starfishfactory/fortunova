export function LoginPage() {
  return (
    <div class="mt-6">
      <div class="text-center mb-6">
        <h2 class="text-2xl font-serif font-bold text-gold-400 mb-2">로그인</h2>
        <hr class="divider-gold" />
      </div>

      <form
        hx-post="/partials/auth/login"
        hx-target="#auth-result"
        hx-indicator="#auth-loading"
        class="glass-card p-6 space-y-5"
      >
        <div>
          <label class="text-sm font-medium text-gray-300 block mb-1">이메일</label>
          <input
            type="email"
            name="email"
            required
            class="input-dark rounded-lg p-2 text-sm w-full"
            placeholder="email@example.com"
          />
        </div>
        <div>
          <label class="text-sm font-medium text-gray-300 block mb-1">비밀번호</label>
          <input
            type="password"
            name="password"
            required
            class="input-dark rounded-lg p-2 text-sm w-full"
            placeholder="8자 이상"
          />
        </div>
        <button
          type="submit"
          class="btn-gold w-full py-3 rounded-lg font-medium text-base"
        >
          로그인
        </button>
      </form>

      <div id="auth-loading" class="htmx-indicator text-center py-4">
        <p class="text-gold-400 animate-pulse">로그인 중...</p>
      </div>
      <div id="auth-result"></div>

      <p class="text-center text-sm text-gray-400 mt-4">
        계정이 없으신가요? <a href="/register" class="text-gold-400 hover:text-gold-300 transition-colors">회원가입</a>
      </p>
    </div>
  );
}
