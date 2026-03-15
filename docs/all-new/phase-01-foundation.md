# Phase 1: Foundation (M2~M4)

> **상위 문서**: [메인 로드맵](../README.md)
> **선행**: Gate 0 통과
> **목표**: 만세력 엔진 + AI 프롬프트 초안 + 개발 환경 구축

---

## 1. 사주 명리학 도메인 학습 (M2~M3)

| 영역 | 산출물 | 기간 |
|------|--------|------|
| 사주 기초 (천간·지지·60갑자·오행) | 도메인 지식 문서 | 2주 |
| 명식 구성 (연·월·일·시주) | 만세력 계산 로직 명세 | 2주 |
| 대운·세운·월운·일운 | 시간축 운세 생성 로직 | 1주 |
| 신살 체계 (역마·도화·문창 등) | 신살 해석 프롬프트 시트 | 1주 |
| 일진 분석 (일간과 당일 간지) | 데일리 운세 핵심 로직 | 2주 |

전문가 자문 1~2회 (30~50만원) 필수.

## 2. 개발 환경 구축 (M2)

| 작업 | 기술 | 기간 |
|------|------|------|
| Flutter 프로젝트 초기화 | Flutter 3.x + Riverpod | 1일 |
| **FastAPI 프로젝트 초기화** | Python 3.12 + FastAPI + SQLAlchemy | 1일 |
| **PostgreSQL Docker 세팅** | docker-compose, 스키마 초안 | 1일 |
| **Firebase 프로젝트 생성** | Auth 설정, Flutter 연동 | 1일 |
| CI/CD | Codemagic + GitHub Actions | 2일 |
| Apple Developer / Google Play 등록 | 계정 생성 | 1일 |
| Mixpanel 초기 통합 | 분석 SDK | 1일 |

### FastAPI 프로젝트 구조 (초기)

```
server/
├── main.py              # FastAPI 앱
├── config.py            # 환경 변수
├── requirements.txt
├── Dockerfile
├── docker-compose.yml   # PostgreSQL + FastAPI
├── auth/
│   └── firebase.py      # Firebase 토큰 검증
├── api/                 # 엔드포인트 (Phase 3~4에서 구현)
├── ai/                  # 프롬프트 엔진 (Phase 2에서 구현)
├── saju/
│   ├── calendar.py      # 만세력 계산
│   └── analysis.py      # 명식 분석
├── db/
│   ├── models.py        # SQLAlchemy 모델
│   └── migrations/      # Alembic
└── jobs/                # 배치 작업 (Phase 2~3)
```

### Docker Compose (초경량)

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
# 총 RAM: ~1GB — DS716+에서도 여유롭게 가능
```

## 3. 만세력 엔진 (M3~M4)

**전략: 오픈소스 기반 → 점진 개선** (자체 구현은 Phase 6 이후)

| 단계 | 작업 | 기간 |
|------|------|------|
| 1 | 기존 Python 만세력 라이브러리 조사+선정 | 2일 |
| 2 | 라이브러리 통합 + 커스터마이징 | 1주 |
| 3 | 기존 만세력 웹 3곳과 100건 교차 검증 | 1주 |
| 4 | 엣지 케이스 수정 (절기 경계, 야자시 등) | 1주 |
| 5 | 전문가 10건 수동 검증 | 2일 |

Python으로 구현하므로 FastAPI 서버와 자연스럽게 통합된다.

## 4. AI 프롬프트 v0.1 (M3~M4)

프롬프트 설계 원칙:
1. 구조화된 JSON 입력 (자연어 X)
2. "지적인 인생 코치" 톤 (미신적 표현 배제)
3. 모든 해석은 DO/DON'T로 귀결
4. 금기: 불안 조장, 건강 진단, 투자 종목 추천 금지

## 마일스톤

| 마일스톤 | 기한 | 완료 기준 |
|---------|------|----------|
| 도메인 학습 | M3 | 지식 문서 + 프롬프트 초안 |
| 개발 환경 | M2 | Flutter + FastAPI + PostgreSQL + Firebase 작동 |
| 만세력 v0.1 | M4 | 100건 교차 검증 통과 |
| 프롬프트 v0.1 | M4 | 기본 사주 해석 + DO/DON'T 생성 확인 |

## 예산: 월 ~10만원 (자문비 별도 30~50만원)

---
> **이전**: [Phase 0](phase-00-prevalidation.md) | **다음**: [Phase 2](phase-02-ai-engine.md)
