# Phase 4: Full MVP & Closed Beta (M10~M14)

> **상위 문서**: [메인 로드맵](../README.md)
> **선행**: Gate 2 통과
> **목표**: 4카테고리 + AI 질문 + 구독 결제 → 구독 전환 검증
> **Gate 3**: 체험→구독 전환 15%+ AND 유료 50명+

---

## 추가 기능 (Ultra MVP 위에)

| 기능 | 개발 기간 |
|------|----------|
| 4카테고리 (총운+커리어+재물+관계) | 2주 |
| AI 질문 채팅 (FastAPI /ai/ask) | 3주 |
| 구독 결제 (RevenueCat) | 2주 |
| 무료 티어 (총운 요약 + DO 1개) | 1주 |
| 과거 아카이브 | 1주 |

## FastAPI 엔드포인트 추가 (총 12개)

```
기존 4개 + 추가:
POST /ai/ask              — AI 질문
GET  /ai/remaining        — 남은 횟수
POST /subscription/verify — 영수증 검증
GET  /subscription/status — 구독 상태
GET  /fortune/history     — 과거 운세
POST /feedback            — 하루 리뷰
PUT  /profiles/me         — 프로필 수정
POST /auth/register-push  — 푸시 토큰 등록
```

## AI 질문 안전장치

| 규칙 | 대응 |
|------|------|
| 의료 진단 | "전문의 상담을 권합니다" |
| 투자 종목 | 재물운 흐름만 안내, 종목 추천 거절 |
| 자해/위기 | 위기 상담 기관 안내 |
| 반복 공격 | 질문 횟수 제한으로 방어 |

## 무료→구독 전환 플로우

```
Day 0: 설치 → 7일 무료 체험 (전체 기능)
Day 3: 배너 "3일째 가이드를 확인하셨네요!"
Day 6: 모달 "체험이 내일 종료됩니다" + 가격 안내
Day 7: 무료 티어로 전환 (총운 요약만, 잠긴 콘텐츠에 CTA)
```

## Closed Beta (M12~M14)

- 규모: 100~200명
- 채널: Ultra MVP 테스터 + 블라인드 + 사주 카페 + Instagram
- 핵심 측정: D30 리텐션 20%+, 구독 전환 15%+, NPS 35+

## 예산: 월 ~30만원 (AI API 증가)

---
> **이전**: [Phase 3](phase-03-ultra-mvp.md) | **다음**: [Phase 5](phase-05-launch.md)
