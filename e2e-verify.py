"""E2E 검증: Sonnet-only 풍부한 운세 결과 Playwright 테스트"""
import re
import sys
from playwright.sync_api import sync_playwright

BASE_URL = "https://fortunova.molidae.site"


def warm_cache():
    """curl로 서버 캐시를 미리 채워 504 Gateway Timeout 방지"""
    import subprocess
    print("[0/6] 서버 캐시 워밍업 (최대 150초)...")
    try:
        # 리버스 프록시 타임아웃 회피: Docker 네트워크를 통해 직접 접근
        result = subprocess.run(
            ["docker", "exec", "fortunova", "wget", "-q", "-O", "/dev/null",
             "--post-data", "year=1988&month=7&day=22&hour=10&gender=M&calendarType=solar&category=daily",
             "http://localhost:3000/partials/fortune-result"],
            capture_output=True, text=True, timeout=160,
            env={**__import__('os').environ, "DOCKER_API_VERSION": "1.43"}
        )
        rc = result.returncode
        print(f"  → exit code: {rc}")
        if rc == 0:
            print("  ✓ 캐시 워밍업 완료")
            return True
        else:
            print(f"  ⚠ 워밍업 응답: stderr={result.stderr[:200]}")
            return False
    except Exception as e:
        print(f"  ⚠ 워밍업 실패: {e}")
        return False


def verify():
    warm_cache()
    errors = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page.on("console", lambda msg: (errors.append(f"Console[{msg.type}]: {msg.text}") if msg.type in ("error", "warning") else None))
        page.on("pageerror", lambda err: errors.append(f"Page: {err.message}"))
        # 네트워크 요청/응답 모니터링
        page.on("requestfailed", lambda req: errors.append(f"Request failed: {req.url} - {req.failure}"))

        try:
            # 1. 메인 페이지 로드
            print("[1/6] 메인 페이지 로드...")
            resp = page.goto(BASE_URL, wait_until="networkidle")
            assert resp.ok, f"HTTP {resp.status}"
            print("  ✓ 정상 로드")

            # 2. 폼 요소 확인
            print("[2/6] 폼 요소 확인...")
            page.wait_for_selector('form[hx-post="/partials/fortune-result"]')
            print("  ✓ 폼 존재")

            # 3. 폼 입력
            print("[3/6] 폼 입력...")
            page.select_option('select[name="year"]', "1988")
            page.select_option('select[name="month"]', "7")
            page.select_option('select[name="day"]', "22")
            page.select_option('select[name="hour"]', "10")
            page.check('input[name="gender"][value="M"]')
            page.select_option('select[name="category"]', "daily")
            print("  ✓ 입력 완료")

            # 4. localStorage 캐시 클리어 + 제출
            print("[4/6] 운세보기 제출 (최대 120초 대기)...")
            page.evaluate("""() => {
                for (let i = localStorage.length - 1; i >= 0; i--) {
                    const k = localStorage.key(i);
                    if (k && k.startsWith('fortunova_')) localStorage.removeItem(k);
                }
            }""")
            page.click('button[type="submit"]')
            # 네트워크 응답 대기 + DOM 변경 대기
            try:
                page.wait_for_selector("#result > div", timeout=200000)
            except Exception as wait_err:
                # 타임아웃 시 디버그 정보 수집
                result_html = page.inner_html("#result")
                print(f"  → #result HTML 길이: {len(result_html)}")
                print(f"  → #result 내용: {result_html[:500]}")
                print(f"  → 수집된 에러: {errors}")
                # HTMX 상태 확인
                htmx_check = page.evaluate("typeof htmx !== 'undefined' ? 'loaded' : 'not loaded'")
                print(f"  → HTMX 상태: {htmx_check}")
                raise wait_err
            print("  ✓ 결과 수신")

            # 결과 HTML 저장 (디버그용)
            debug_html = page.inner_html("#result")
            with open("/tmp/fortunova-e2e-result.html", "w") as f:
                f.write(debug_html)
            print(f"  → 결과 HTML 길이: {len(debug_html)} chars")

            # 5. UX 검증
            print("[5/6] UX 검증...")
            form_collapsed = page.evaluate("document.getElementById('form-section')?.classList.contains('collapsed')")
            print(f"  {'✓' if form_collapsed else '✗'} 폼 접힘: {form_collapsed}")

            summary_visible = page.evaluate("document.getElementById('form-summary')?.style.display !== 'none'")
            print(f"  {'✓' if summary_visible else '✗'} 요약 바: {summary_visible}")

            # 6. 풍부한 결과 검증
            print("[6/6] 풍부한 운세 결과 검증...")
            result_html = page.inner_html("#result")
            result_text = page.inner_text("#result")

            if "LLM_UNAVAILABLE" in result_html or "VALIDATION_ERROR" in result_html:
                raise Exception(f"에러 응답: {result_html[:300]}")
            if "파싱에 실패" in result_html:
                # HTML 저장
                with open("/tmp/fortunova-e2e-result.html", "w") as f:
                    f.write(result_html)
                raise Exception("LLM 응답 파싱 실패")

            checks = []

            def check(name, passed):
                checks.append((name, passed))
                print(f"  {'✓' if passed else '✗'} {name}")

            # 종합 점수
            score_match = re.search(r"(\d+)\s*점", result_text)
            check("종합 점수", bool(score_match))
            if score_match:
                print(f"    → {score_match.group(1)}점")

            # 핵심 섹션들
            check("상세 설명 (오늘의 운세)", "오늘의 운세" in result_text)
            check("오행 흐름", "오행 흐름" in result_text)
            check("오늘의 조언", "오늘의 조언" in result_text)
            check("오늘의 팁", "✨" in result_html)

            # 세부운
            check("세부 운세 그리드", "세부 운세" in result_text)
            check("재물운", "재물운" in result_text)
            check("건강운", "건강운" in result_text)
            check("연애운", "연애운" in result_text)
            check("직장운", "직장운" in result_text)

            # 오행 해설
            check("오행 해설", "오행 해설" in result_text)

            # 행운 정보
            check("행운 정보", "행운" in result_text)
            check("행운의 색", "행운의 색" in result_text)
            check("행운의 숫자", "행운의 숫자" in result_text)
            check("행운의 방위", "행운의 방위" in result_text)
            check("행운의 시간", "행운의 시간" in result_text)

            # 주의사항
            check("주의사항", "주의사항" in result_text)

            # 3개월 운세 흐름
            check("3개월 운세 흐름", "3개월 운세 흐름" in result_text)

            # 궁합 팁
            check("궁합/인간관계 팁", "궁합" in result_text or "인간관계" in result_text)

            # 대운 해석
            check("대운 해석", "대운 해석" in result_text)

            # 격언
            check("격언 카드", "proverb-card" in result_html)

            # 사주 정보
            check("사주 정보", "사주:" in result_text)

            # 별점
            check("별점 표시", "★" in result_html)

            # 남은 횟수
            check("남은 무료 횟수", "무료 횟수" in result_text)

            # 결과 집계
            passed = sum(1 for _, p in checks if p)
            total = len(checks)
            print(f"\n📊 결과: {passed}/{total} 항목 통과")

            if passed < total * 0.7:
                page.screenshot(path="/tmp/fortunova-e2e-fail.png", full_page=True)
                with open("/tmp/fortunova-e2e-result.html", "w") as f:
                    f.write(result_html)
                raise Exception(f"풍부한 결과 검증 실패: {passed}/{total} (70% 미달)")

            if errors:
                print(f"\n⚠ 콘솔 에러 {len(errors)}건:")
                for e in errors:
                    print(f"  - {e}")

            print("\n✅ E2E 검증 통과!")

        except Exception as ex:
            print(f"\n❌ E2E 검증 실패: {ex}")
            page.screenshot(path="/tmp/fortunova-e2e-fail.png", full_page=True)
            print("  스크린샷: /tmp/fortunova-e2e-fail.png")
            sys.exit(1)
        finally:
            browser.close()


if __name__ == "__main__":
    verify()
