export function RegisterPage() {
  const years = Array.from({ length: 101 }, (_, i) => 1950 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div class="mt-4">
      <h2 class="text-lg font-bold text-gray-800 mb-4">회원가입</h2>
      <form
        hx-post="/partials/auth/register"
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
            minLength={8}
            class="border rounded-lg p-2 text-sm w-full"
            placeholder="8자 이상"
          />
        </div>

        <fieldset class="space-y-2">
          <legend class="text-sm font-medium text-gray-700">생년월일</legend>
          <div class="grid grid-cols-3 gap-2">
            <select name="birthYear" class="border rounded-lg p-2 text-sm" required>
              <option value="">년</option>
              {years.map((y) => (
                <option value={String(y)}>{y}년</option>
              ))}
            </select>
            <select name="birthMonth" class="border rounded-lg p-2 text-sm" required>
              <option value="">월</option>
              {months.map((m) => (
                <option value={String(m)}>{m}월</option>
              ))}
            </select>
            <select name="birthDay" class="border rounded-lg p-2 text-sm" required>
              <option value="">일</option>
              {days.map((d) => (
                <option value={String(d)}>{d}일</option>
              ))}
            </select>
          </div>
        </fieldset>

        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">출생 시간</label>
          <select name="birthHour" class="border rounded-lg p-2 text-sm w-full">
            <option value="">모름</option>
            {hours.map((h) => (
              <option value={String(h)}>{h}시</option>
            ))}
          </select>
        </div>

        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">성별</label>
          <div class="flex gap-4">
            <label class="flex items-center gap-1">
              <input type="radio" name="gender" value="M" checked />
              <span class="text-sm">남성</span>
            </label>
            <label class="flex items-center gap-1">
              <input type="radio" name="gender" value="F" />
              <span class="text-sm">여성</span>
            </label>
          </div>
        </div>

        <div>
          <label class="flex items-center gap-2">
            <input type="checkbox" name="isLunar" value="true" />
            <span class="text-sm text-gray-700">음력 생일</span>
          </label>
        </div>

        <button
          type="submit"
          class="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          회원가입
        </button>
      </form>
      <div id="auth-loading" class="htmx-indicator text-center py-4 text-indigo-600">
        처리 중...
      </div>
      <div id="auth-result"></div>
      <p class="text-center text-sm text-gray-500 mt-4">
        이미 계정이 있으신가요? <a href="/login" class="text-indigo-600 hover:underline">로그인</a>
      </p>
    </div>
  );
}
