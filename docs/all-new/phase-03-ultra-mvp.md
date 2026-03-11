# Phase 3: Ultra MVP Build (M7~M10)

> **상위 문서**: [메인 로드맵](../README.md)
> **선행**: Gate 1 통과
> **목표**: 총운 + 실행 가이드만으로 리텐션 검증
> **Gate 2**: D7 리텐션 35%+ AND NPS 30+

---

## Ultra MVP 범위

| 포함 | 제외 (Phase 4로) |
|------|-----------------|
| 사주 프로필 등록 | 4카테고리 (커리어/재물/관계) |
| 데일리 운세 (총운) + DO/DON'T | AI 질문 기능 |
| 푸시 알림 (FCM) | 구독 결제 |
| Firebase Auth 로그인 | 과거 아카이브 |

## 디자인: Calm Authority

컬러: 딥 네이비 #1A1A2E + 골드 #C9A96E + 화이트. 점쟁이가 아닌 컨설턴트 느낌.

## Flutter 개발 (M7~M9, 12주)

| 주차 | 작업 |
|------|------|
| M7 W1 | 디자인 시스템 (컬러, 타이포, 위젯) |
| M7 W2~3 | 온보딩 + Firebase Auth 연동 |
| M7 W4 | 사주 프로필 → FastAPI 연동 |
| M8 W1~2 | 홈 (운세 점수 + DO/DON'T 카드) |
| M8 W3 | 내 사주 탭 (명식 카드, 오행 차트) |
| M8 W4 | 푸시 (FCM) |
| M9 W1~2 | 백엔드 연동 완성 |
| M9 W3~4 | QA + RC 빌드 |

## FastAPI 엔드포인트 (4개만)

```
POST /profiles          — 사주 프로필 생성
GET  /profiles/me       — 내 프로필
GET  /fortune/today     — 오늘의 운세 (캐시)
GET  /saju/card         — 명식 카드 데이터
```

Firebase Auth가 로그인을 처리하므로 서버는 프로필+운세만.

## 테스트 (M9~M10): 30~50명, D7 35%+ 목표

## 예산: 월 ~10만원

---
> **이전**: [Phase 2](phase-02-ai-engine.md) | **다음**: [Phase 4](phase-04-full-mvp.md)
