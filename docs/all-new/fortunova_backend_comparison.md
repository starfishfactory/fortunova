# Fortunova — 백엔드 기술 선택: Supabase vs 자체 구현 비교 분석

> **목적**: Supabase 없이 구현할 경우의 공수 차이와 트레이드오프를 정밀 비교  
> **결론 먼저**: 자체 구현 시 백엔드 개발에 +4~8주 추가, 대신 인프라 복잡도와 의존성 대폭 감소

---

## 1. 기능별 공수 비교

### 1.1 DB (PostgreSQL)

Supabase든 자체든 어차피 PostgreSQL을 쓴다. 차이는 거의 없다.

| 항목 | Supabase | 자체 구현 |
|------|---------|----------|
| DB 설치·운영 | Supabase가 래핑 | docker run postgres |
| 스키마 관리 | Studio UI + SQL | SQL 직접 또는 Prisma/Drizzle |
| 마이그레이션 | Supabase CLI | Prisma Migrate / dbmate |
| **공수 차이** | — | **+1~2일** (초기 세팅만) |

**결론**: DB는 차이 없음. PostgreSQL 직접 띄우는 건 docker-compose 한 줄이면 끝.

---

### 1.2 인증 (Auth)

여기가 가장 큰 분기점이다.

| 항목 | Supabase GoTrue | 자체 구현 |
|------|----------------|----------|
| 이메일 가입/로그인 | 내장 | 직접 구현 |
| JWT 발급/검증 | 자동 | 직접 구현 |
| 소셜 로그인 (카카오, 애플) | 설정만 하면 됨 | OAuth 직접 연동 |
| 비밀번호 리셋 | 내장 | 이메일 발송 로직 직접 |
| 세션 관리 | 내장 | 직접 구현 |
| Flutter SDK | supabase_flutter 패키지 | 직접 HTTP 클라이언트 |

자체 구현 시 선택지:

| 대안 | 공수 | 복잡도 | 비고 |
|------|------|--------|------|
| **Firebase Auth만 사용** | +1~2일 | 낮음 | 무료, Flutter SDK 우수, DB만 별도 |
| **Appwrite** | +2~3일 | 중간 | Supabase 대안, 셀프호스팅 가능 |
| **직접 구현 (Dart 서버)** | +2~3주 | 높음 | JWT, 해시, 세션 전부 직접 |
| **직접 구현 (Node.js/Python)** | +1~2주 | 중간 | Passport.js / FastAPI 활용 |

**결론**: Auth를 완전 자체 구현하면 +2~3주. Firebase Auth만 빌려오면 +1~2일로 줄일 수 있다.

---

### 1.3 REST API

| 항목 | Supabase PostgREST | 자체 구현 |
|------|-------------------|----------|
| DB 테이블 → API 자동 생성 | ✅ 자동 | ❌ 직접 작성 |
| 필터/정렬/페이지네이션 | 쿼리 파라미터로 자동 | 직접 구현 |
| Row Level Security | PostgreSQL RLS 활용 | 미들웨어에서 직접 |
| API 문서 | 자동 생성 | Swagger/OpenAPI 직접 |

자체 구현 시 선택지:

| 대안 | 공수 | 비고 |
|------|------|------|
| **Dart 서버 (shelf/dart_frog)** | +2~3주 | Flutter와 같은 언어, 풀스택 Dart |
| **Node.js (Express/Fastify)** | +1~2주 | 생태계 넓음, 레퍼런스 많음 |
| **Python (FastAPI)** | +1~2주 | AI 코드와 동일 언어, 타입 안전 |
| **Go (Gin/Echo)** | +2~3주 | 성능 최고, 학습 필요 |

하지만 Fortunova MVP의 API는 사실 많지 않다:

```
Fortunova MVP에 필요한 API 엔드포인트 (전체):

[Auth]
  POST /auth/register          — 회원가입
  POST /auth/login             — 로그인
  POST /auth/refresh           — 토큰 갱신
  POST /auth/password-reset    — 비밀번호 리셋

[사주 프로필]
  POST /profiles               — 프로필 생성 (생년월일 입력)
  GET  /profiles/me            — 내 프로필 조회
  PUT  /profiles/me            — 프로필 수정

[데일리 운세]
  GET  /fortune/today          — 오늘의 운세 조회 (캐시)
  GET  /fortune/history        — 과거 운세 목록

[AI 질문]
  POST /ai/ask                 — AI에게 질문
  GET  /ai/remaining           — 남은 질문 횟수

[구독]
  POST /subscription/verify    — 앱스토어 영수증 검증
  GET  /subscription/status    — 구독 상태 확인

[피드백]
  POST /feedback               — 하루 리뷰 제출

총 엔드포인트: ~12개
```

12개 엔드포인트라면 자체 구현해도 **1~2주면 충분**하다.

**결론**: Supabase의 자동 API 생성은 편리하지만, Fortunova의 API가 12개뿐이라 자체 구현해도 공수 차이가 크지 않다.

---

### 1.4 서버 로직 (Edge Functions 대체)

Supabase Edge Functions(Deno)가 하는 일:
- LLM API 호출 (API 키 보호)
- 프롬프트 조립 (사주 데이터 → 프롬프트)
- 응답 후처리 (점수 산출, 모순 검출)
- 배치 운세 생성 (새벽 cron)

이건 **어떤 방식이든 서버 코드를 작성해야 한다**. Supabase Edge Functions이든 자체 서버든 코드 양은 동일하다.

| 대안 | 공수 차이 | 비고 |
|------|----------|------|
| Dart 서버로 통합 | 0 (API와 합침) | 코드베이스 통일 |
| Python FastAPI로 통합 | 0 | AI 코드와 자연스럽게 통합 |
| Cloud Functions (GCP/AWS) | +1~2일 | 배포 설정만 추가 |

**결론**: 차이 없음. 오히려 자체 서버에서 AI 로직을 직접 짜는 게 Edge Functions의 Deno 환경 제약(패키지 호환성 등)보다 자유롭다.

---

## 2. 총 공수 비교 요약

### 시나리오 A: Supabase 사용

```
백엔드 개발 공수:
  DB 스키마 설계:     3일
  Supabase 설정:     2일
  Edge Functions:    2주 (AI 로직)
  Flutter 연동:      1주 (supabase_flutter 패키지)
  ─────────────────────
  합계:              ~3.5주
```

### 시나리오 B: 자체 구현 (Dart 풀스택)

```
백엔드 개발 공수:
  DB 스키마 + PostgreSQL 세팅:  2일
  Auth 구현 (JWT 직접):         2주
  REST API 12개:               1.5주
  AI 로직 (프롬프트+LLM):       2주 (동일)
  Flutter 연동:                1주
  ─────────────────────────
  합계:                        ~6.5주
  차이:                        +3주
```

### 시나리오 C: 하이브리드 (Firebase Auth + 자체 서버)

```
백엔드 개발 공수:
  DB 스키마 + PostgreSQL 세팅:  2일
  Firebase Auth 연동:          2일
  REST API 12개:               1.5주
  AI 로직 (프롬프트+LLM):       2주 (동일)
  Flutter 연동:                1주
  ─────────────────────────
  합계:                        ~5주
  차이:                        +1.5주
```

### 시나리오 D: 하이브리드 (Firebase Auth + Python FastAPI)

```
백엔드 개발 공수:
  DB 스키마 + PostgreSQL 세팅:  2일
  Firebase Auth 연동:          2일
  FastAPI 서버 + API 12개:     1주
  AI 로직 통합 (Python 네이티브): 1.5주 (Python이라 더 빠름)
  Flutter 연동 (http 패키지):   1주
  ─────────────────────────
  합계:                        ~4주
  차이:                        +0.5주 (거의 동일!)
```

---

## 3. 공수 외 트레이드오프

### 3.1 Supabase 사용의 장점

| 장점 | 설명 |
|------|------|
| 빠른 프로토타이핑 | 테이블 만들면 API 자동 |
| Auth 걱정 없음 | 소셜 로그인, 이메일 인증 등 즉시 사용 |
| Studio UI | 웹에서 DB 관리, 편리 |
| Flutter SDK | supabase_flutter 패키지가 잘 만들어져 있음 |
| 커뮤니티 | 레퍼런스, 튜토리얼 풍부 |

### 3.2 Supabase 사용의 단점 (Fortunova 맥락에서)

| 단점 | 설명 | 영향도 |
|------|------|--------|
| **셀프호스팅 복잡도** | 컨테이너 10개+, 맥미니 256GB에서 부담 | 🔴 높음 |
| **Edge Functions 제약** | Deno 환경, Python AI 코드와 분리 | 🟡 중간 |
| **벤더 의존** | Supabase 버전 업데이트 시 호환성 관리 | 🟡 중간 |
| **디버깅 어려움** | 여러 컨테이너 간 문제 추적 복잡 | 🟡 중간 |
| **오버스펙** | Realtime, Storage 등 안 쓰는 기능도 리소스 차지 | 🟡 중간 |
| **학습 비용** | Supabase 자체의 컨벤션, RLS, 정책 학습 | 🟢 낮음 |

### 3.3 자체 구현의 장점

| 장점 | 설명 |
|------|------|
| **인프라 단순화** | PostgreSQL 1개 + 서버 1개 = 컨테이너 2개면 끝 |
| **256GB 친화적** | Docker 이미지 2~3개만 필요, SSD 절약 |
| **NAS 8GB에서도 가능** | 맥미니 없이도 DS716+에서 돌릴 수 있음 |
| **완전한 통제** | 모든 코드가 내 것, 벤더 의존 없음 |
| **AI 로직 통합** | Python 서버에서 AI + API를 한 코드베이스로 |
| **디버깅 용이** | 로그 하나, 프로세스 하나 |

### 3.4 자체 구현의 단점

| 단점 | 설명 |
|------|------|
| Auth 직접 구현의 보안 리스크 | 비밀번호 해싱, JWT, 세션 관리를 직접 해야 함 |
| 추가 개발 공수 | +0.5~3주 (방식에 따라) |
| Flutter SDK 없음 | supabase_flutter 대신 http 패키지로 직접 연동 |

---

## 4. 추천 시나리오: 각 상황별

### 상황 1: 맥미니 클러스터가 있다면 → Supabase 유지 가능

```
맥미니 2대 (32GB 총) + DS716+ (스토리지)
→ Supabase 경량 구성 충분히 가능
→ 원래 계획대로 진행
→ 공수: ~3.5주
```

### 상황 2: DS716+ 단독으로 시작한다면 → 자체 구현 추천

```
DS716+ 8GB만으로 시작
→ Supabase 셀프호스팅은 8GB에서 고통
→ 시나리오 D (Firebase Auth + FastAPI) 추천
→ 공수: ~4주 (+0.5주 차이)
→ 컨테이너 2개면 됨 (PostgreSQL + FastAPI)
```

### 상황 3: 가장 린하게 가고 싶다면 → 시나리오 D 최강

```
시나리오 D: Firebase Auth + Python FastAPI + PostgreSQL

장점 종합:
  ✅ 공수 차이 겨우 +0.5주
  ✅ 컨테이너 2개 (PostgreSQL + FastAPI)
  ✅ RAM 1GB면 충분 (DS716+에서도 가능)
  ✅ AI 코드(Python)와 서버 코드 통합 → 한 코드베이스
  ✅ Auth는 Firebase 무료 티어 (월 5만 MAU까지 무료)
  ✅ FastAPI 자동 문서화 (Swagger UI)
  ✅ 벤더 의존 최소 (Firebase Auth만, 나중에 교체 가능)
```

---

## 5. 시나리오 D 상세 아키텍처

가장 린한 선택지인 시나리오 D의 구체적 구현 방법.

### 5.1 기술 스택

| 레이어 | 기술 | 비고 |
|--------|------|------|
| 프론트엔드 | Flutter (Dart) | 변동 없음 |
| 인증 | Firebase Auth | 무료 티어, Flutter SDK 우수 |
| 서버 | Python FastAPI | AI + API 통합 |
| DB | PostgreSQL 15 | Docker, 변동 없음 |
| ORM | SQLAlchemy 또는 Prisma (Python) | 마이그레이션 포함 |
| 캐시 | Redis (선택) | 운세 캐시. 없으면 DB 캐시 테이블 |
| 결제 | RevenueCat | 변동 없음 |
| 푸시 | Firebase Cloud Messaging | Auth와 같은 Firebase 프로젝트 |

### 5.2 아키텍처 다이어그램

```
┌──────────┐     ┌─────────────────────┐     ┌──────────┐
│ Flutter  │────→│  Python FastAPI      │────→│ LLM API  │
│ App      │     │                     │     │ (Claude) │
│          │←────│  - /auth/* (Firebase │←────│          │
└──────────┘     │    토큰 검증만)      │     └──────────┘
     │           │  - /fortune/*       │
     │           │  - /ai/*            │
     │           │  - /subscription/*  │
     ↓           │  - AI 프롬프트 엔진  │
┌──────────┐     │  - 운세 생성 배치    │
│ Firebase │     └──────────┬──────────┘
│ Auth     │                │
│ (인증)   │         ┌──────┴──────┐
└──────────┘         │ PostgreSQL  │
                     │ (데이터)    │
                     └─────────────┘

컨테이너: 2개 (FastAPI + PostgreSQL)
Firebase Auth: 클라우드 (설치 불필요)
```

### 5.3 Docker Compose (초경량)

```yaml
version: "3.8"

services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: fortunova
    volumes:
      - ./data/postgres:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    deploy:
      resources:
        limits:
          memory: 512M

  api:
    build: ./server
    environment:
      DATABASE_URL: postgresql://postgres:${DB_PASSWORD}@db:5432/fortunova
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
      FIREBASE_PROJECT_ID: ${FIREBASE_PROJECT_ID}
    ports:
      - "8000:8000"
    depends_on:
      - db
    deploy:
      resources:
        limits:
          memory: 512M

# 총 메모리: ~1GB (DS716+에서도 여유롭게 가능!)
```

### 5.4 FastAPI 서버 구조 (예시)

```
server/
├── main.py                 # FastAPI 앱 엔트리
├── requirements.txt
├── Dockerfile
├── config.py               # 환경 변수 관리
├── auth/
│   ├── firebase.py         # Firebase 토큰 검증
│   └── dependencies.py     # 인증 미들웨어
├── api/
│   ├── profiles.py         # 사주 프로필 CRUD
│   ├── fortune.py          # 데일리 운세 조회
│   ├── ai_chat.py          # AI 질문
│   ├── subscription.py     # 구독 상태
│   └── feedback.py         # 하루 리뷰
├── ai/
│   ├── prompt_engine.py    # 프롬프트 조립
│   ├── llm_client.py       # Claude/GPT API 호출
│   ├── consistency.py      # 일관성 검증
│   └── postprocess.py      # 후처리 (점수, DO/DON'T)
├── saju/
│   ├── calendar.py         # 만세력 계산
│   ├── analysis.py         # 명식 분석
│   └── daily.py            # 일진 계산
├── db/
│   ├── models.py           # SQLAlchemy 모델
│   ├── schemas.py          # Pydantic 스키마
│   └── migrations/         # Alembic 마이그레이션
└── jobs/
    └── daily_fortune.py    # 새벽 배치 운세 생성 (cron)
```

### 5.5 DS716+에서의 메모리 사용 예측

```
시나리오 D를 DS716+ 8GB에서 돌릴 경우:

DSM 시스템:         ~1GB
기존 서비스 (3~5개): ~2GB
PostgreSQL:         ~0.5GB
FastAPI 서버:       ~0.5GB
─────────────────────
합계:               ~4GB
여유:               ~4GB ← 넉넉!

→ 맥미니 없이도 DS716+만으로 개발 가능
→ 맥미니는 Flutter 빌드 + VS Code용으로만 활용
```

---

## 6. 최종 비교 매트릭스

| 항목 | Supabase 셀프호스팅 | 시나리오 D (FastAPI) |
|------|-------------------|-------------------|
| 백엔드 개발 공수 | ~3.5주 | ~4주 (+0.5주) |
| Docker 컨테이너 수 | 5~10개 | **2개** |
| 최소 RAM | 3~4GB | **1GB** |
| DS716+ 단독 가능 | ❌ 고통스러움 | **✅ 여유롭게** |
| 맥미니 256GB 부담 | 중간 | **거의 없음** |
| 벤더 의존 | Supabase | Firebase Auth만 (교체 용이) |
| AI 코드 통합 | Edge Functions (Deno) | **Python 네이티브 (자연스러움)** |
| 디버깅 | 컨테이너 여러 개 | **서버 하나** |
| 학습 비용 | Supabase 컨벤션 | FastAPI (직관적) |
| 커뮤니티/레퍼런스 | Supabase 풍부 | FastAPI 매우 풍부 |
| 스케일링 | Supabase Cloud 마이그레이션 | Cloud Run 등 배포 |
| Flutter 연동 | supabase_flutter (편리) | http + firebase_auth (약간 더 수동) |

---

## 7. 결론

| 상황 | 추천 |
|------|------|
| 맥미니 2대가 이미 있고, 빠르게 시작하고 싶다 | Supabase |
| 맥미니 구매 전이고, DS716+로 먼저 시작하고 싶다 | **시나리오 D** |
| 인프라 복잡도를 최소화하고 싶다 | **시나리오 D** |
| AI 코드와 백엔드를 한 코드베이스로 관리하고 싶다 | **시나리오 D** |
| 최소 공수로 가고 싶다 | Supabase (0.5주 절약) |
| 장기적으로 완전한 통제를 원한다 | **시나리오 D** |

> **핵심 발견**: Supabase를 안 쓴다고 해서 공수가 크게 늘지 않는다. 
> Fortunova의 API가 12개뿐이고, Firebase Auth가 인증을 대신하며, 
> Python FastAPI는 AI 코드와 자연스럽게 통합된다.
> 오히려 인프라가 극적으로 단순해지는 이점이 +0.5주 공수를 상쇄하고도 남는다.
