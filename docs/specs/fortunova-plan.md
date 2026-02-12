# Fortunova - AI 운세 웹사이트 구현 계획

## Context

운세 서비스 5곳(네이트 운세, 포스텔러, 신운세, Co-Star, 신한생명/농협)을 비교 분석한 결과, **사주/명리 중심 + AI 초개인화**를 핵심 차별점으로 한 운세 웹사이트를 구축한다. NAS(DS716+, 2GB RAM) 배포를 전제로 최경량 스택을 선택한다.

### 확정된 요구사항
- **운세 체계**: 사주/명리(동양) 중심, 확장 가능 구조 (타로/별자리 등)
- **차별화**: LLM + 사주 DB 하이브리드 (전통 명리 규칙 엔진 + Claude API 자연어 풀이)
- **제외**: 1:1 전문가 상담, 커뮤니티/게시판
- **플랫폼**: 웹 우선 (반응형/PWA)
- **수익모델**: 하루 3회 무료, 이상은 구독
- **MVP**: 오늘의 운세만 먼저
- **개발 방식**: TDD, 단계별 검증, PR (깃모지)

---

## 서비스 비교 분석

### 비교 대상 5개 서비스

| 구분 | 네이트 운세 | 포스텔러 | 신운세 | Co-Star | 신한생명/농협 |
|------|------------|---------|--------|---------|-------------|
| **유형** | 포털 웹 | 모바일 앱 | 전문 웹 | 모바일 앱 | 기업 프로모션 웹 |
| **수익모델** | 유료콘텐츠 + 전화상담 | 구독 + 개별구매 | 연간 구독 | 무료 (광고) | 무료 (브랜딩) |
| **누적 이용자** | - | 860만+ | - | 3,000만+ | - |

### 기능별 비교

| 기능 | 네이트 | 포스텔러 | 신운세 | Co-Star | 신한/농협 | **Fortunova** |
|------|--------|---------|--------|---------|----------|---------------|
| **사주/명리** | O | O | O (핵심) | X | O | **O (핵심)** |
| **토정비결** | O | O | O | X | O | Phase 5+ |
| **타로** | O | O | X | X | X | Phase 5+ |
| **별자리/점성술** | X | O | X | O (핵심) | X | Phase 5+ |
| **궁합** | O | O | O | O (친구비교) | O | Phase 5+ |
| **오늘의 운세** | O | O | O | O (AI push) | O | **O (MVP)** |
| **신년운세** | O | O | O | X | O (시즌한정) | Phase 5+ |
| **꿈해몽** | O | X | X | X | X | X |
| **만세력** | X | O (별도앱) | O | X | X | Phase 5+ |
| **택일(길일)** | X | O (캘린더) | O | X | X | Phase 5+ |
| **작명/이름풀이** | X | X | O | X | X | X |
| **AI 개인화** | X | O (데이터기반) | X | O (NASA+AI) | X | **O (핵심)** |
| **소셜/친구** | X | X | X | O (핵심) | X | Phase 5+ |
| **1:1 전문가 상담** | O (전화) | X | X | X | X | **X (제외)** |
| **커뮤니티** | O | X | X | X | X | **X (제외)** |
| **Push 알림** | X | O | X | O | X | Phase 5+ |

### 각 서비스의 핵심 차별점

1. **네이트 운세** - 전통 포털형. 콘텐츠 다양하지만 UX가 올드함. 전문가 전화상담이 독특
2. **포스텔러** - 동서양 운세 통합 + 매월 22편 신규 콘텐츠. 운세 캘린더(길일), 마이페이트북(이력관리)이 강점
3. **신운세** - 사주/명리 전문 특화. 만세력, 택일, 작명 등 전통 역학 도구 집중
4. **Co-Star** - 서양 점성술 + AI. NASA 데이터 기반 초개인화. 소셜(친구 차트 비교)이 핵심 바이럴 요소
5. **신한생명/농협** - 기업 마케팅용 무료. 시즌 한정이지만 진입 장벽 없음

### Fortunova 차별화 포인트
- **사주/명리 + AI 초개인화**: Co-Star의 AI 접근법을 동양 명리학에 적용
- **전통 규칙 엔진 + LLM 하이브리드**: 정확한 명리 분석 + 자연어 해설의 결합
- **확장 가능 구조**: 플러그인 패턴으로 타로/별자리 등 추후 추가

---

## 기술 스택

DS716+ (Celeron N3160, 2GB RAM) 제약에 맞춘 최경량 조합:

### 프레임워크 비교

| 스택 | Docker 이미지 | 유휴 메모리(RSS) | 장점 | 단점 |
|------|--------------|-----------------|------|------|
| **Hono + HTMX (Node.js)** | ~80MB | ~40-60MB | 초경량, 빠른 라우팅 | 프론트 생태계 작음 |
| Hono + HTMX (Bun) | ~240MB | ~50-70MB | 빠른 성능 | 메모리 누수 보고 |
| Next.js standalone | ~180MB | ~150-300MB | 풍부한 생태계 | **2GB RAM에서 위험** |
| SvelteKit + Bun | ~250MB | ~80-120MB | 우수한 DX | Bun 안정성 우려 |
| Astro (SSR) | ~100MB | ~60-90MB | 콘텐츠 최적화 | 동적 기능 불편 |

### 최종 선택

| 영역 | 선택 | 이유 |
|------|------|------|
| **런타임** | Node.js 20 LTS (Alpine) | 안정성 검증됨, Bun 대비 메모리 누수 위험 없음 |
| **서버** | Hono v4 | 14KB, Web Standards, 미들웨어 풍부 |
| **프론트** | HTMX + Hono JSX | 클라이언트 프레임워크 불필요, SSR + 부분 업데이트 |
| **스타일** | Tailwind CSS (빌드타임) | 사용 클래스만 추출 |
| **DB** | SQLite (better-sqlite3) | 별도 프로세스 없음, 파일 기반 |
| **ORM** | Drizzle ORM | 경량, TypeScript 네이티브 |
| **LLM** | Claude API (@anthropic-ai/sdk) | 한국어 품질, 구조화 출력 강점 |
| **인증** | 자체 JWT (jose) | 외부 의존성 최소화 |
| **테스트** | Vitest | 빠른 실행, TypeScript 네이티브 |
| **배포** | Docker (node:20-alpine) | 이미지 ~80MB, RSS ~80-125MB |

**예상 메모리**: ~80-125MB (512MB 컨테이너 제한 내 안전)

---

## 아키텍처

```
[Browser] --HTMX--> [Hono Server]
                        |
                   [Fortune Service]
                     /          \
              [Saju Engine]   [Claude API]
              (명리 규칙)     (자연어 풀이)
                     \          /
                    [SQLite DB]
                   (캐시/사용자/구독)
```

### 핵심 설계 포인트

1. **사주 엔진**: 자체 구현 (천간지지, 오행, 60갑자, 만세력, 사주팔자, 십신, 오행균형, 일간강약)
2. **LLM 연동**: 사주 엔진 분석 결과 → 구조화 프롬프트 → Claude → 자연어 풀이
3. **캐시**: 같은 사용자+같은 날+같은 카테고리 = 캐시 히트 (SQLite)
4. **무료 제한**: 인증 사용자는 userId, 비인증은 IP+UA fingerprint 기준 일일 3회
5. **확장**: `FortuneSystem` 플러그인 인터페이스로 타로/별자리 등 추가 가능

### 사주 엔진 모듈 구조

```
src/engine/
  core/                    # 천간, 지지, 오행, 60갑자, 음양
  calendar/                # 양음력 변환, 24절기, 진태양시 보정
  saju/                    # 사주팔자, 십신, 12운성, 신살, 대운/세운
  analysis/                # 오행균형, 일간강약, 용신
  types/                   # 타입 정의
  data/                    # 음력/절기 데이터 (1900-2100)
```

### 핵심 타입 정의

```typescript
type HeavenlyStem = '갑'|'을'|'병'|'정'|'무'|'기'|'경'|'신'|'임'|'계';
type EarthlyBranch = '자'|'축'|'인'|'묘'|'진'|'사'|'오'|'미'|'신'|'유'|'술'|'해';
type FiveElement = '목'|'화'|'토'|'금'|'수';

interface FourPillars {
  year: GanJi;   // 년주
  month: GanJi;  // 월주
  day: GanJi;    // 일주
  hour: GanJi;   // 시주
}

interface SajuAnalysis {
  fourPillars: FourPillars;
  tenGods: Record<string, TenGod>;
  elementBalance: Record<FiveElement, number>;
  dayMasterStrength: 'strong' | 'weak' | 'neutral';
  usefulGod: FiveElement;
  majorFate: MajorFatePeriod[];
}
```

### LLM 연동 흐름

```
[사용자 요청]
  → [Saju Engine: 사주 계산]
  → [SajuAnalysis 객체]
  → [Prompt Builder: 구조화 프롬프트]
  → [Claude API 호출]
  → [Response Parser]
  → [Cache 저장 (SQLite)]
  → [HTMX 응답 (HTML partial)]
```

### 확장 가능한 운세 플러그인

```typescript
interface FortuneSystem {
  id: string;                    // 'saju', 'tarot', 'zodiac'
  name: string;
  requiredInput: InputField[];
  analyze(input: Record<string, unknown>): Promise<SystemAnalysis>;
  buildPrompt(analysis: SystemAnalysis, category: FortuneCategory): string;
  parseResult(llmResponse: string): FortuneResult;
}
```

---

## 디렉토리 구조

```
fortunova/
  src/
    index.ts                  # 진입점
    app.ts                    # Hono 앱
    config.ts                 # 환경 설정
    engine/                   # 사주 엔진
      core/                   # 천간, 지지, 오행, 60갑자, 음양
      calendar/               # 양음력 변환, 24절기, 진태양시
      saju/                   # 사주팔자, 십신, 12운성, 신살, 대운/세운
      analysis/               # 오행균형, 일간강약, 용신
      types/                  # 타입 정의
      data/                   # 음력/절기 데이터
    fortune/                  # 운세 시스템 (플러그인)
      types.ts                # FortuneSystem 인터페이스
      registry.ts             # 시스템 레지스트리
      systems/saju-system.ts  # MVP 사주 시스템
    services/
      llm.ts                  # Claude API 연동
      prompt-builder.ts       # 프롬프트 생성
      fortune.ts              # 오케스트레이션
      auth.ts                 # 인증
      subscription.ts         # 구독
    routes/
      pages.tsx               # SSR 페이지
      api/                    # API 엔드포인트
      partials/               # HTMX partial 응답
    middleware/
      rate-limit.ts           # 무료 횟수 제한
      auth.ts                 # JWT 검증
    db/
      schema.ts               # Drizzle 스키마
      migrate.ts              # 마이그레이션
    views/                    # JSX 템플릿
  tests/
    engine/                   # 사주 엔진 단위 테스트
    services/                 # 서비스 통합 테스트
    fixtures/
      known-saju-cases.ts     # 검증된 사주 정답 데이터
  docker/
    Dockerfile
    docker-compose.yml
```

---

## DB 스키마

- **users**: id, email, passwordHash, gender, birthYear/Month/Day/Hour, isLunar, isLeapMonth
- **fortune_cache**: cacheKey(unique), date, category, sajuData(JSON), fortune(AI텍스트), score, expiresAt
- **daily_usage**: identifier, identifierType(user/anonymous), date, count
- **subscriptions**: userId, plan(monthly/yearly), status, startDate, endDate
- **payments**: userId, amount, status, provider, providerPaymentId

---

## MVP 단계 분할

### Phase 1: 프로젝트 셋업 + 사주 엔진 핵심

**1-1. 프로젝트 초기화**
- npm init, TypeScript, Vitest, ESLint
- Hono 앱 기본 구조 + Hello World
- Docker + SQLite + Drizzle 셋업
- GitHub Actions CI (lint + test)

**1-2. 사주 엔진 - 기초 데이터 (TDD)**
- 천간(10), 지지(12), 오행, 음양 매핑
- 60갑자 순환 테이블
- 상생/상극 관계

**1-3. 사주 엔진 - 달력 변환 (TDD)**
- KASI 기반 양음력 변환 (1900-2100)
- 24절기 데이터 + 절기 기반 월 판별
- 진태양시 보정

**1-4. 사주 엔진 - 사주팔자 계산 (TDD)**
- 년주(입춘 기준), 월주(절기 기준), 일주(만세력), 시주
- 통합 `calculateFourPillars()` 함수
- **최소 50개 알려진 사주 케이스로 교차 검증**

### Phase 2: AI 풀이 연동 + 기본 UI

**2-1. 사주 분석 고도화**
- 십신, 오행 균형, 일간 강약 판별

**2-2. Claude API 연동**
- 프롬프트 빌더 (사주 분석 → 구조화 프롬프트)
- 응답 파서, 캐시, 에러 핸들링

**2-3. 기본 UI**
- 레이아웃 (Tailwind + HTMX)
- 생년월일시 입력 폼 (양력/음력, 시간)
- 운세 결과 페이지 (HTMX partial)
- 모바일 반응형

### Phase 3: 인증 + 무료 횟수 제한

- 회원가입/로그인 (이메일 + 비밀번호)
- JWT 미들웨어
- 일일 사용량 추적 (인증: userId, 비인증: fingerprint)
- 초과 시 구독 유도 UI
- PWA (manifest, Service Worker)

### Phase 4: 구독/결제

- 토스페이먼츠 or 카카오페이 연동
- 구독 플랜 (월간/연간)
- 결제 API + 웹훅
- 마이페이지

### Phase 5+: 확장

- 12운성, 신살 상세 분석
- 대운/세운 차트 시각화
- 타로 시스템 플러그인
- 별자리 운세 플러그인
- 궁합 기능
- 푸시 알림 (매일 아침 운세)
- 소셜 로그인 (카카오, 구글)
- 운세 공유 기능

---

## TDD 전략

### 테스트 피라미드
- **Unit (80%)**: 천간/지지/오행 매핑, 달력 변환, 사주 계산 각 함수
- **Integration (15%)**: 사주엔진→LLM→응답 전체 흐름 (LLM mock)
- **E2E (5%)**: Playwright 전체 플로우

### 사주 정확도 검증
- 만세력닷컴, 더큼만세력, 척척만세력 등 **3개 이상 사이트에서 교차 검증**한 50+ 케이스
- 경계 조건 필수 포함:
  - 입춘 전후 (년주 전환)
  - 절기 경계 (월주 전환)
  - 야자시/조자시 (23:00-01:00)
  - 윤달
  - 연말연시
  - 데이터 범위 경계 (1900, 2100)

---

## Docker 배포

```yaml
# docker-compose.yml
services:
  fortunova:
    build: .
    ports: ["3000:3000"]
    volumes: [fortunova-data:/app/data]
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - JWT_SECRET=${JWT_SECRET}
      - DATABASE_PATH=/app/data/fortunova.db
    deploy:
      resources:
        limits:
          memory: 512M    # NAS 2GB 중 512MB 할당
          cpus: '2.0'     # 4코어 중 2코어
    restart: unless-stopped
```

### 예상 메모리 사용량

| 항목 | 메모리 |
|------|--------|
| Node.js 기본 RSS | ~40MB |
| Hono + 미들웨어 | ~5MB |
| SQLite | ~10-20MB |
| 사주 데이터 (in-memory) | ~5-10MB |
| 요청 처리 버퍼 | ~20-50MB |
| **총 예상** | **~80-125MB** |

---

## 검증 방법

1. **사주 엔진**: `vitest` 단위 테스트 50+ 케이스 전체 통과
2. **API 통합**: LLM mock으로 Fortune Service 통합 테스트
3. **UI**: 브라우저에서 생년월일 입력 → 운세 결과 표시 확인
4. **Docker**: `docker compose up` → NAS 환경 시뮬레이션 → 메모리 512MB 제한 내 동작 확인
5. **무료 제한**: 4번째 요청 시 구독 유도 화면 노출 확인
