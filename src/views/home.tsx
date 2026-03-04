export function HomePage() {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 101 }, (_, i) => 1950 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div class="mt-6">
      <div class="text-center mb-6">
        <h2 class="text-2xl font-serif font-bold text-gold-400 mb-2">사주 운세 보기</h2>
        <hr class="divider-gold" />
        <p class="text-sm text-gray-400">생년월일을 입력하고 오늘의 운세를 확인하세요</p>
      </div>

      {/* 접힌 상태에서 보이는 입력 요약 */}
      <div id="form-summary" class="form-summary" style="display:none">
        <div class="glass-card p-3 flex items-center justify-between">
          <div class="flex items-center gap-2 text-sm">
            <span class="text-gold-400">🔮</span>
            <span id="summary-text" class="text-gray-300"></span>
          </div>
          <button id="reopen-form" class="text-xs text-gold-400 hover:text-gold-300 underline cursor-pointer shrink-0">
            다시 입력
          </button>
        </div>
      </div>

      <div id="form-section" class="form-section">
      <form
        hx-post="/partials/fortune-result"
        hx-target="#result"
        hx-indicator="#loading"
        class="glass-card p-6 space-y-5"
      >
        {/* 생년월일 */}
        <fieldset class="space-y-2">
          <legend class="text-sm font-medium text-gray-300">생년월일</legend>
          <div class="grid grid-cols-3 gap-2">
            <select name="year" class="input-dark rounded-lg p-2 text-sm" required>
              <option value="">년</option>
              {years.map((y) => (
                <option value={String(y)} selected={y === currentYear - 30}>
                  {y}년
                </option>
              ))}
            </select>
            <select name="month" class="input-dark rounded-lg p-2 text-sm" required>
              <option value="">월</option>
              {months.map((m) => (
                <option value={String(m)}>{m}월</option>
              ))}
            </select>
            <select name="day" class="input-dark rounded-lg p-2 text-sm" required>
              <option value="">일</option>
              {days.map((d) => (
                <option value={String(d)}>{d}일</option>
              ))}
            </select>
          </div>
        </fieldset>

        {/* 출생 시간 */}
        <div>
          <label class="text-sm font-medium text-gray-300 block mb-1">출생 시간</label>
          <select name="hour" class="input-dark rounded-lg p-2 text-sm w-full">
            <option value="">모름</option>
            {hours.map((h) => (
              <option value={String(h)}>{h}시</option>
            ))}
          </select>
        </div>

        {/* 양력/음력 */}
        <div>
          <label class="text-sm font-medium text-gray-300 block mb-1">달력 유형</label>
          <div class="flex gap-4">
            <label class="flex items-center gap-1">
              <input type="radio" name="calendarType" value="solar" checked class="radio-dark" />
              <span class="text-sm text-gray-300">양력</span>
            </label>
            <label class="flex items-center gap-1">
              <input
                type="radio"
                name="calendarType"
                value="lunar"
                class="radio-dark"
                onclick="document.getElementById('leapMonthField').style.display='block'"
              />
              <span class="text-sm text-gray-300">음력</span>
            </label>
          </div>
        </div>

        {/* 윤달 여부 */}
        <div id="leapMonthField" style="display:none">
          <label class="flex items-center gap-2">
            <input type="checkbox" name="isLeapMonth" value="true" class="checkbox-dark" />
            <span class="text-sm text-gray-300">윤달</span>
          </label>
        </div>

        {/* 성별 */}
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

        {/* 운세 카테고리 */}
        <div>
          <label class="text-sm font-medium text-gray-300 block mb-1">운세 카테고리</label>
          <select name="category" class="input-dark rounded-lg p-2 text-sm w-full">
            <option value="daily">오늘의 운세</option>
            <option value="love">연애운</option>
            <option value="career">직장운</option>
            <option value="health">건강운</option>
            <option value="wealth">재물운</option>
          </select>
        </div>

        {/* 제출 버튼 */}
        <button
          type="submit"
          class="btn-gold w-full py-3 rounded-lg font-medium text-base"
        >
          운세 보기
        </button>
      </form>
      </div>

      {/* 로딩 인디케이터 */}
      <div id="loading" class="htmx-indicator">
        <div class="loading-container text-center py-8">
          <div class="orb-glow mx-auto mb-4"></div>
          <p class="text-gold-400 font-medium mb-2">운세를 분석하고 있습니다...</p>
          <p id="loading-tip" class="text-sm text-gray-400 transition-opacity duration-500"></p>
        </div>
      </div>

      {/* 결과 영역 */}
      <div id="result"></div>
    </div>
  );
}
