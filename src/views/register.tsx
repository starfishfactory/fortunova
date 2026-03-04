export function RegisterPage() {
  const years = Array.from({ length: 101 }, (_, i) => 1950 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div class="mt-6">
      <div class="text-center mb-6">
        <h2 class="text-2xl font-serif font-bold text-gold-400 mb-2">회원가입</h2>
        <hr class="divider-gold" />
      </div>

      <form
        hx-post="/partials/auth/register"
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
            minLength={8}
            class="input-dark rounded-lg p-2 text-sm w-full"
            placeholder="8자 이상"
          />
        </div>

        <fieldset class="space-y-2">
          <legend class="text-sm font-medium text-gray-300">생년월일</legend>
          <div class="grid grid-cols-3 gap-2">
            <select name="birthYear" class="input-dark rounded-lg p-2 text-sm" required>
              <option value="">년</option>
              {years.map((y) => (
                <option value={String(y)}>{y}년</option>
              ))}
            </select>
            <select name="birthMonth" class="input-dark rounded-lg p-2 text-sm" required>
              <option value="">월</option>
              {months.map((m) => (
                <option value={String(m)}>{m}월</option>
              ))}
            </select>
            <select name="birthDay" class="input-dark rounded-lg p-2 text-sm" required>
              <option value="">일</option>
              {days.map((d) => (
                <option value={String(d)}>{d}일</option>
              ))}
            </select>
          </div>
        </fieldset>

        <div>
          <label class="text-sm font-medium text-gray-300 block mb-1">출생 시간</label>
          <select name="birthHour" class="input-dark rounded-lg p-2 text-sm w-full">
            <option value="">모름</option>
            {hours.map((h) => (
              <option value={String(h)}>{h}시</option>
            ))}
          </select>
        </div>

        <div>
          <label class="text-sm font-medium text-gray-300 block mb-1">성별</label>
          <div class="flex gap-4">
            <label class="flex items-center gap-1">
              <input type="radio" name="gender" value="M" checked class="radio-dark" />
              <span class="text-sm text-gray-300">남성</span>
            </label>
            <label class="flex items-center gap-1">
              <input type="radio" name="gender" value="F" class="radio-dark" />
              <span class="text-sm text-gray-300">여성</span>
            </label>
          </div>
        </div>

        <div>
          <label class="flex items-center gap-2">
            <input type="checkbox" name="isLunar" value="true" class="checkbox-dark" />
            <span class="text-sm text-gray-300">음력 생일</span>
          </label>
        </div>

        <button
          type="submit"
          class="btn-gold w-full py-3 rounded-lg font-medium text-base"
        >
          회원가입
        </button>
      </form>

      <div id="auth-loading" class="htmx-indicator text-center py-4">
        <p class="text-gold-400 animate-pulse">처리 중...</p>
      </div>
      <div id="auth-result"></div>

      <p class="text-center text-sm text-gray-400 mt-4">
        이미 계정이 있으신가요? <a href="/login" class="text-gold-400 hover:text-gold-300 transition-colors">로그인</a>
      </p>
    </div>
  );
}
