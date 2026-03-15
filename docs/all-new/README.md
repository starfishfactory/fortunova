# Fortunova — 제품 로드맵 v2.1

> **제품명**: Fortunova (Fortune + Nova)
> **슬로건**: "매일 아침, 당신의 사주가 오늘의 전략을 알려줍니다"
> **문서 버전**: v2.1 (Supabase → FastAPI 전환 반영)
> **작성일**: 2026년 3월
> **백엔드 스택**: Python FastAPI + Firebase Auth + PostgreSQL (컨테이너 2개)

---

## 문서 체계

| 문서 | 내용 |
|------|------|
| **본 문서 (메인)** | 전략, 원칙, 아키텍처, KPI, 리스크, Gate 체계 |
| [Phase 0: Pre-validation](phases/phase-00-prevalidation.md) | 사전 수요 검증 |
| [Phase 1: Foundation](phases/phase-01-foundation.md) | 기반 구축 |
| [Phase 2: Core AI Engine](phases/phase-02-ai-engine.md) | AI 엔진 개발 |
| [Phase 3: Ultra MVP](phases/phase-03-ultra-mvp.md) | 핵심 앱 구현 |
| [Phase 4: Full MVP & Beta](phases/phase-04-full-mvp.md) | 전체 기능 + 베타 |
| [Phase 5: Public Launch](phases/phase-05-launch.md) | 정식 출시 |
| [Phase 6: Growth Engine](phases/phase-06-growth.md) | 성장 가속 |
| [Phase 7: Deep Personalization](phases/phase-07-personalization.md) | 개인화 고도화 |
| [Phase 8: Platform Expansion](phases/phase-08-expansion.md) | 플랫폼 확장 |
| [Phase 9~10: Ecosystem & Scale](phases/phase-09-10-ecosystem-scale.md) | 생태계·스케일 |
| **[인프라 아키텍처](infra-architecture.md)** | **Mac Mini 클러스터 + DS716+ 구성** |
| **[Flutter 배포 가이드](flutter-deployment.md)** | **iOS + Android + Web 배포 전략** |

---

## 1. 전략 개요

### 1.1 한 문장 정의

> **Fortunova는 사주 명리학 기반의 AI 분석 엔진을 통해, 30~40대 직장인에게 매일 개인화된 실행 가이드를 제공하는 구독 서비스다.**

### 1.2 핵심 가치 제안

사용자에게 전달하는 가치는 "AI"도 "사주"도 아니다. **"매일 아침의 전략적 루틴"**이다.

```
기존 앱: "오늘 운이 좋습니다 / 나쁩니다"
Fortunova: "오늘 이것을 하세요 / 이것은 피하세요, 왜냐하면..."
```

### 1.3 전략 파라미터

| 항목 | 결정 | 근거 |
|------|------|------|
| 포지셔닝 | 사주 기반 데일리 전략 루틴 | 가치 중심 커뮤니케이션 |
| 타깃 | 30~40대 직장인 | 높은 결제력 + 실질적 고민 |
| 핵심 경험 | 데일리 운세 + 실행 가이드 | 매일 새로운 가치 = 구독 유지 |
| 수익모델 | 구독 + 1회성 보조 상품 | 안정적 MRR + 계절 수익 |
| 앱 | Flutter (Dart) | 솔로 팀 크로스 플랫폼 |
| 백엔드 | **Python FastAPI + Firebase Auth** | 초경량 2컨테이너, AI 코드 통합 |
| MVP 기간 | 15개월 | Phase 0 사전 검증 포함 |

### 1.4 차별화 풀 루프

```
[사주 분석] → [해석] → [실행 가이드] → [사용자 실행] → [리뷰] → [AI 학습] → [더 정교한 가이드]
기존 앱은 [분석] → [해석] → 끝.
```

---

## 2. 시장 & 경쟁

### 2.1 시장 기회

| 시장 | 규모 |
|------|------|
| TAM | 1.4조원+ (한국 점술 시장) |
| SAM | 2,000억원 (디지털 운세 앱) |
| SOM (3년) | 20~30억원 (구독 3만명 × 6,900~9,000원) |

### 2.2 경쟁 방어

| 복제 가능 | 복제 어려움 (진짜 해자) |
|----------|---------------------|
| 실행 가이드 컨셉 | 피드백 루프 데이터 축적 |
| AI 사주 해석 | 30~40대 특화 프롬프트 최적화 |
| 데일리 푸시 | 구독 사용자의 전환 비용 |

---

## 3. 수익 모델

| 플랜 | 가격 | 수수료 후 |
|------|------|----------|
| 무료 | 0원 | — |
| Basic 월간 | 6,900원/월 | 4,830원 |
| Basic 연간 | 49,900원/연 | 34,930원 |
| Premium 월간 | 12,900원/월 | 9,030원 |
| Premium 연간 | 99,900원/연 | 69,930원 |

손익분기: MRR 500만원 (유료 ~770명)

---

## 4. 기술 아키텍처

### 4.1 기술 스택

| 레이어 | 기술 | 선정 이유 |
|--------|------|----------|
| 프론트엔드 | Flutter 3.x (Dart) | 크로스 플랫폼, 솔로 팀 |
| 상태관리 | Riverpod | Flutter 최신 표준 |
| 인증 | **Firebase Auth** | 무료 5만 MAU, 소셜 로그인, Flutter SDK |
| 백엔드 | **Python FastAPI** | AI 코드 통합, 자동 문서화, 경량 |
| DB | **PostgreSQL 15** | Docker 1컨테이너, 안정성 |
| ORM | SQLAlchemy + Alembic | 마이그레이션 포함 |
| AI | Claude API (주) / GPT-4o (부) | 다중 벤더 |
| 만세력 | Python (서버 계산) | AI 코드와 통합 |
| 결제 | RevenueCat | 구독 통합 |
| 푸시 | Firebase Cloud Messaging | Firebase Auth와 같은 프로젝트 |
| 분석 | Mixpanel | 행동 추적 |
| CI/CD | Codemagic + GitHub Actions | 빌드 자동화 |

### 4.2 아키텍처

```
┌──────────┐     ┌──────────────────┐     ┌──────────┐
│ Flutter  │────→│  FastAPI 서버      │────→│ Claude   │
│ App      │←────│  (API + AI 통합)  │←────│ API      │
└──────────┘     └────────┬─────────┘     └──────────┘
     │                    │
     ↓              ┌─────┴─────┐
┌──────────┐        │PostgreSQL │
│ Firebase │        │ (1컨테이너)│
│ Auth     │        └───────────┘
└──────────┘
              Docker 컨테이너: 2개만!
```

### 4.3 왜 이 스택인가

- **컨테이너 2개** (FastAPI + PostgreSQL) — DS716+ 8GB에서도 가능
- **AI 코드 통합** — 프롬프트 엔진이 Python이니 서버와 한 코드베이스
- **Firebase Auth만 외부** — 인증만 빌려오고 나머지는 자체 통제
- **공수 차이 +0.5주** — Supabase 대비 거의 동일

---

## 5. 타임라인

```
2026 Q2~Q4  Phase 0~3: 검증 → 기반 → AI → Ultra MVP
2027 Q1~Q2  Phase 4~5: Full MVP → 🚀 출시
2027 Q3~    Phase 6~:  성장 → 개인화 → 확장
2029        Phase 9~10: 생태계 → 스케일
```

비용: 출시까지 15개월, 약 390만원 (인건비 제외)

---

## 6. Go/No-Go Gate

| Gate | 시점 | 통과 기준 |
|------|------|----------|
| 0 | M2 | 랜딩 전환 5%+, 수동 MVP 리텐션 50%+ |
| 1 | M7 | AI 품질 검증, 만세력 정확도 100% |
| 2 | M10 | Ultra MVP D7 리텐션 35%+, NPS 30+ |
| 3 | M14 | 구독 전환 15%+, 유료 50명+ |
| 4 | M18 | MRR 2,000만+, Churn 12% 이하 |

---

## 7. 핵심 원칙

1. **실행 가능성 우선** — 모든 운세는 DO/DON'T로 귀결
2. **Calm Authority** — 점쟁이가 아닌 코치의 톤
3. **Gate 존중** — 기준 미달 시 데이터로 판단
4. **비용 전에 검증** — 수동 MVP → Ultra → Full
5. **3+1 리듬** — 3주 스프린트 + 1주 휴식

> **Fortunova의 성패 = 실행 가이드 품질 + Churn 관리**

---

> Phase별 상세 → [phases/](phases/) | 인프라 → [infra-architecture.md](infra-architecture.md)
