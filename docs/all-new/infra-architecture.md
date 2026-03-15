# Fortunova — 인프라 아키텍처: Mac Mini M4 클러스터

> **상위 문서**: [메인 로드맵](README.md)
> **하드웨어**: Mac Mini M4 ×2 (10코어, 16GB, 256GB) + DS716+ (8GB, HDD)
> **백엔드**: Python FastAPI + PostgreSQL (컨테이너 2개)
> **인증**: Firebase Auth (클라우드, 설치 불필요)
> **오케스트레이션**: Docker Swarm (Thunderbolt 5 연결)

---

## 1. 하드웨어 구성

| 장비 | 역할 | RAM | SSD |
|------|------|-----|-----|
| Mac Mini ① (Manager) | 개발 환경 (VS Code + Flutter) | 16GB | 256GB |
| Mac Mini ② (Worker) | 서비스 실행 (FastAPI + PostgreSQL) | 16GB | 256GB |
| DS716+ (Storage) | NFS 스토리지 + 백업 | 8GB | HDD |

### 물리적 연결

```
Mac Mini ① ◄══ Thunderbolt 5 (120Gbps) ══► Mac Mini ②
     │                                          │
     └──────── 기가빗 LAN (공유기) ─────────────┘
                       │
                  DS716+ (NFS)
```

## 2. 노드 역할

### Manager (Mac Mini ①) — "코딩하는 곳"

```
상주 서비스:                        RAM
  VS Code Server (code-server)     ~800MB
  Flutter SDK + Android SDK        ~1.5GB (빌드 시 ~3GB)
  Cloudflare Tunnel (외부 접속)     ~50MB
  Portainer (Docker 관리 UI)       ~100MB
  ─────────────────────────────
  합계: ~3GB 상주 / ~5GB 빌드 시
  여유: ~11GB
```

### Worker (Mac Mini ②) — "서비스가 돌아가는 곳"

```
상주 서비스:                        RAM
  FastAPI 서버                     ~300MB
  PostgreSQL 15                    ~500MB
  Redis (선택, 캐시)                ~128MB
  AI 프롬프트 테스트 환경            ~200MB
  ─────────────────────────────
  합계: ~1.1GB
  여유: ~15GB (매우 넉넉)
```

**Supabase 구성 대비**: 컨테이너 10개(~4GB) → **2개(~1GB)**. 14GB 절약.

### DS716+ — "데이터가 쌓이는 곳"

```
NFS 공유:
  /volume1/fortunova/
  ├─ db-data/       # PostgreSQL 데이터 (Worker가 NFS 마운트)
  ├─ backups/       # 일간 자동 백업
  ├─ logs/          # 서비스 로그
  └─ ai-results/    # 프롬프트 테스트 결과
```

## 3. 256GB SSD 생존 전략

**핵심: Xcode 설치 안 함** (iOS 빌드는 Codemagic 클라우드)

```
Manager SSD 사용:               Worker SSD 사용:
  macOS:           ~25GB          macOS:           ~25GB
  Docker 이미지:    ~5GB           Docker 이미지:    ~3GB
  Flutter+Android: ~25GB          로컬 캐시:        ~1GB
  VS Code+확장:    ~2GB           ────────────────────
  프로젝트 소스:    ~3GB           합계:             ~29GB
  캐시/스왑:       ~10GB          여유:             ~227GB
  ────────────────────
  합계:            ~70GB
  여유:            ~186GB ← 충분
```

**PostgreSQL 데이터, 로그, AI 결과 → NAS(NFS)로** SSD 보호.

## 4. Docker Swarm 구성

```bash
# Manager에서
docker swarm init --advertise-addr 10.0.0.1  # Thunderbolt IP

# Worker에서
docker swarm join --token SWMTKN-xxx 10.0.0.1:2377

# 레이블
docker node update --label-add role=manager mac-mini-1
docker node update --label-add role=worker mac-mini-2
```

## 5. Docker Stack (FastAPI + PostgreSQL)

```yaml
version: "3.8"

networks:
  fortunova:
    driver: overlay

volumes:
  db-data:
    driver: local
    driver_opts:
      type: nfs
      o: "addr=192.168.1.100,rw,nolock,soft"
      device: ":/volume1/fortunova/db-data"

services:
  db:
    image: postgres:15-alpine
    networks: [fortunova]
    volumes:
      - db-data:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: fortunova
    deploy:
      placement:
        constraints: [node.labels.role == worker]
      resources:
        limits:
          memory: 512M
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s

  api:
    image: fortunova/api:latest
    networks: [fortunova]
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://postgres:${DB_PASSWORD}@db:5432/fortunova
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
      FIREBASE_PROJECT_ID: ${FIREBASE_PROJECT_ID}
      REDIS_URL: redis://redis:6379
    deploy:
      placement:
        constraints: [node.labels.role == worker]
      resources:
        limits:
          memory: 512M

  redis:
    image: redis:7-alpine
    networks: [fortunova]
    command: redis-server --maxmemory 128mb --maxmemory-policy allkeys-lru
    deploy:
      placement:
        constraints: [node.labels.role == worker]
      resources:
        limits:
          memory: 192M

  portainer:
    image: portainer/portainer-ce:latest
    ports:
      - "9443:9443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    deploy:
      placement:
        constraints: [node.labels.role == manager]
      resources:
        limits:
          memory: 128M
```

**총 컨테이너: 4개** (FastAPI + PostgreSQL + Redis + Portainer)
**총 RAM: ~1.3GB** — Supabase 대비 1/3

## 6. 외부 접속 (Cloudflare Tunnel)

```yaml
# ~/.cloudflared/config.yml
tunnel: fortunova
ingress:
  - hostname: api.fortunova.app
    service: http://10.0.0.2:8000          # Worker의 FastAPI
  - hostname: code.fortunova.app
    service: http://localhost:8080          # Manager의 VS Code
  - hostname: portainer.fortunova.app
    service: https://localhost:9443
    originRequest:
      noTLSVerify: true
  - service: http_status:404
```

| 서브도메인 | 서비스 | 보안 |
|-----------|--------|------|
| api.fortunova.app | FastAPI 서버 | Firebase JWT 검증 |
| code.fortunova.app | VS Code Server | Cloudflare Access |
| portainer.fortunova.app | Portainer | Cloudflare Access |

**DB 관리**: pgAdmin 또는 DBeaver를 로컬(Manager)에서 실행, Thunderbolt 경유 Worker DB 접속. 웹 노출 불필요.

## 7. Phase별 인프라 활용

| Phase | 인프라 | 비고 |
|-------|--------|------|
| 0 (M1~M2) | 맥미니 없음 → DS716+ 또는 로컬 | 랜딩페이지는 Cloudflare Pages |
| 1~2 (M2~M7) | 맥미니 세팅 + 개발 | DS716+에서도 FastAPI 가능 |
| 3~4 (M7~M14) | 풀스택 개발 | Flutter + FastAPI 전체 가동 |
| 5 (M14~M15) | **프로덕션 서버 겸용** | 초기 1,000~3,000명 커버 |
| 6+ (M16~) | 사용자 증가 → 클라우드 검토 | Cloud Run 등 마이그레이션 |

## 8. 비용

| 항목 | 비용 |
|------|------|
| Mac Mini M4 ×2 | ~160만원 (1회) |
| TB5 케이블 + 이더넷 | ~6만원 (1회) |
| 전기세 (월) | ~1.5만원 |
| Cloudflare | 0원 (무료) |
| 도메인 | ~2만원/년 |
| **월 운영비** | **~3만원** (AI API 별도) |

## 9. DS716+로 먼저 시작하기 (맥미니 구매 전)

FastAPI + PostgreSQL은 컨테이너 2개, RAM 1GB면 충분하므로 **DS716+ 8GB에서도 가능**하다.

```
DS716+ 8GB 배분:
  DSM + 기존 서비스: ~3GB
  PostgreSQL:       ~0.5GB
  FastAPI:          ~0.5GB
  여유:             ~4GB ← 넉넉
```

Phase 0~2 (사전 검증 + 기반 + AI 엔진)를 DS716+에서 진행하고,
Flutter 빌드가 필요한 Phase 3부터 맥미니를 투입하는 것도 가능하다.

---
> **상위**: [메인 로드맵](README.md)
