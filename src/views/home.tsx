export function HomePage() {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 101 }, (_, i) => 1950 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div class="mt-4">
      <h2 class="text-lg font-bold text-gray-800 mb-4">사주 운세 보기</h2>
      <form
        hx-post="/partials/fortune-result"
        hx-target="#result"
        hx-indicator="#loading"
        class="space-y-4"
      >
        {/* 생년월일 */}
        <fieldset class="space-y-2">
          <legend class="text-sm font-medium text-gray-700">생년월일</legend>
          <div class="grid grid-cols-3 gap-2">
            <select name="year" class="border rounded-lg p-2 text-sm" required>
              <option value="">년</option>
              {years.map((y) => (
                <option value={String(y)} selected={y === currentYear - 30}>
                  {y}년
                </option>
              ))}
            </select>
            <select name="month" class="border rounded-lg p-2 text-sm" required>
              <option value="">월</option>
              {months.map((m) => (
                <option value={String(m)}>{m}월</option>
              ))}
            </select>
            <select name="day" class="border rounded-lg p-2 text-sm" required>
              <option value="">일</option>
              {days.map((d) => (
                <option value={String(d)}>{d}일</option>
              ))}
            </select>
          </div>
        </fieldset>

        {/* 출생 시간 */}
        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">출생 시간</label>
          <select name="hour" class="border rounded-lg p-2 text-sm w-full">
            <option value="">모름</option>
            {hours.map((h) => (
              <option value={String(h)}>{h}시</option>
            ))}
          </select>
        </div>

        {/* 양력/음력 */}
        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">달력 유형</label>
          <div class="flex gap-4">
            <label class="flex items-center gap-1">
              <input type="radio" name="calendarType" value="solar" checked />
              <span class="text-sm">양력</span>
            </label>
            <label class="flex items-center gap-1">
              <input
                type="radio"
                name="calendarType"
                value="lunar"
                onclick="document.getElementById('leapMonthField').style.display='block'"
              />
              <span class="text-sm">음력</span>
            </label>
          </div>
        </div>

        {/* 윤달 여부 */}
        <div id="leapMonthField" style="display:none">
          <label class="flex items-center gap-2">
            <input type="checkbox" name="isLeapMonth" value="true" />
            <span class="text-sm text-gray-700">윤달</span>
          </label>
        </div>

        {/* 성별 */}
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

        {/* 운세 카테고리 */}
        <div>
          <label class="text-sm font-medium text-gray-700 block mb-1">운세 카테고리</label>
          <select name="category" class="border rounded-lg p-2 text-sm w-full">
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
          class="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          운세 보기
        </button>
      </form>

      {/* 로딩 인디케이터 */}
      <div id="loading" class="htmx-indicator text-center py-4 text-indigo-600">
        운세를 분석하고 있습니다...
      </div>

      {/* 결과 영역 */}
      <div id="result"></div>
    </div>
  );
}
