# Fortunova 프로젝트

AI 사주/명리 운세 시스템. SDD spec: `docs/specs/fortunova-system-architecture.md`

## 기술 스택

- **런타임**: Node.js 20 LTS (Alpine)
- **서버**: Hono v4
- **DB**: SQLite (better-sqlite3) + Drizzle ORM
- **프론트엔드**: HTMX + Hono JSX + Tailwind CSS
- **테스트**: Vitest
- **LLM**: Claude CLI headless mode

## 컨벤션

- TDD 방식: RED → GREEN → REFACTOR → COMMIT
- 테스트: `describe`=모듈명, `it`=한국어 "~한다"
- 커밋 메시지: gitmoji 사용
- PR: `:gitmoji: Phase X-Y: 설명`

## 주요 명령어

```bash
npm run dev        # 개발 서버 (tsx watch)
npm run build      # TypeScript 빌드
npm test           # 테스트 실행
npm run lint       # ESLint
npm run typecheck  # 타입 체크
```

## 디렉토리 구조

- `src/engine/types/` - 공유 타입 계약
- `src/engine/core/` - 천간/지지/오행/60갑자
- `src/engine/calendar/` - 양음력 변환, 절기
- `src/engine/saju/` - 사주팔자 계산
- `src/engine/analysis/` - 십신/오행균형/일간강약
- `src/fortune/` - FortuneSystem 플러그인
- `src/services/` - LLM, 인증, 구독
- `src/routes/` - API 라우트
- `src/views/` - JSX 템플릿
- `src/db/` - Drizzle ORM 스키마
- `tests/fixtures/known-saju-cases.ts` - 교차검증 사주 데이터
