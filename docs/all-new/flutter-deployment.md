# Fortunova — Flutter 배포 가이드

> **상위 문서**: [메인 로드맵](README.md) | [인프라](infra-architecture.md)  
> **대상**: Flutter 처음인 솔로 개발자  
> **배포 플랫폼**: iOS (App Store) + Android (Google Play) + Web  
> **빌드 전략**: 로컬 Android + 클라우드 iOS (Codemagic) + 로컬 Web  
> **256GB SSD 전략**: Xcode 미설치, iOS 빌드는 클라우드에서

---

## 목차

1. [배포 전략 개요](#1-배포-전략-개요)
2. [사전 준비 (전 플랫폼 공통)](#2-사전-준비)
3. [Android 배포](#3-android-배포)
4. [iOS 배포](#4-ios-배포)
5. [Web 배포](#5-web-배포)
6. [CI/CD 파이프라인 (Codemagic)](#6-cicd-파이프라인)
7. [Phase별 배포 전략](#7-phase별-배포-전략)
8. [배포 체크리스트](#8-배포-체크리스트)

---

## 1. 배포 전략 개요

### 1.1 빌드 위치 결정

| 플랫폼 | 빌드 위치 | 이유 |
|--------|----------|------|
| Android | **맥미니 로컬** | Android SDK만 필요 (~15GB), M4에서 빠름 |
| iOS | **Codemagic 클라우드** | Xcode 불필요 (SSD 30GB 절약), 무료 500분/월 |
| Web | **맥미니 로컬** | `flutter build web` 한 줄, 추가 도구 불필요 |

### 1.2 배포 흐름 전체 그림

```
[개발 (맥미니 Manager)]
  │
  ├─ git push → GitHub
  │
  ├─── [Android] ──→ 로컬 빌드 ──→ .aab 파일 ──→ Google Play Console 업로드
  │
  ├─── [iOS] ────→ Codemagic 자동 빌드 ──→ .ipa 파일 ──→ App Store Connect 자동 업로드
  │
  └─── [Web] ────→ 로컬 빌드 ──→ build/web/ ──→ Cloudflare Pages 배포
```

### 1.3 배포 빈도 계획

| Phase | 배포 대상 | 빈도 |
|-------|----------|------|
| Phase 3 (Ultra MVP) | TestFlight + Firebase Distribution | 주 1~2회 |
| Phase 4 (Beta) | TestFlight + Firebase Distribution | 주 1회 |
| Phase 5 (출시) | App Store + Google Play + Web | 출시 1회 |
| Phase 5+ (운영) | 전 플랫폼 | 2주 1회 (정기 업데이트) |

---

## 2. 사전 준비

### 2.1 계정 준비

| 계정 | 비용 | 준비 기간 | 비고 |
|------|------|----------|------|
| Apple Developer Program | 129,000원/년 | 승인 1~3일 | iOS 배포 필수 |
| Google Play Console | 25달러 (1회) | 즉시 | Android 배포 필수 |
| Codemagic | 무료 | 즉시 | GitHub 연동, 500분/월 무료 |
| Cloudflare | 무료 | 즉시 | Web 호스팅 (Pages) |
| GitHub | 무료 | 즉시 | 코드 저장소 |

**Apple Developer 등록 주의사항**:
- 개인 개발자로 등록 (법인 불필요, Phase 초기)
- 본인 확인 서류 필요, 승인에 24~48시간 소요
- D-U-N-S 번호는 개인 등록 시 불필요

### 2.2 Flutter 프로젝트 설정

```bash
# 맥미니 Manager에서

# Flutter 설치
brew install --cask flutter
flutter doctor  # 환경 점검

# 프로젝트 생성
flutter create --org com.fortunova --project-name fortunova fortunova_app
cd fortunova_app

# 플랫폼별 활성화 확인
flutter config --enable-web  # Web 빌드 활성화
```

### 2.3 앱 기본 정보 설정

```yaml
# pubspec.yaml
name: fortunova
description: "매일 아침, 사주가 알려주는 오늘의 전략"
version: 1.0.0+1   # 버전+빌드넘버

environment:
  sdk: '>=3.3.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  firebase_core: ^2.27.0
  firebase_auth: ^4.17.0
  firebase_messaging: ^14.7.0
  http: ^1.2.0
  flutter_riverpod: ^2.5.0
  shared_preferences: ^2.2.0
  # ... 기타 의존성
```

---

## 3. Android 배포

Android가 가장 단순하다. 맥미니 로컬에서 전부 처리.

### 3.1 Android SDK 설치

```bash
# Android command-line tools (Android Studio 전체 설치보다 가벼움)
brew install --cask android-commandlinetools

# 필수 SDK 컴포넌트
sdkmanager "platforms;android-34" "build-tools;34.0.0" "platform-tools"

# 환경 변수 (~/.zshrc에 추가)
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Flutter doctor로 Android 인식 확인
flutter doctor
```

### 3.2 앱 서명 키 생성 (최초 1회)

```bash
# 릴리스용 키스토어 생성
keytool -genkey -v \
  -keystore ~/fortunova-release-key.jks \
  -keyalg RSA -keysize 2048 \
  -validity 10000 \
  -alias fortunova

# 비밀번호 설정 (반드시 안전하게 보관!)
# → DS716+ 백업 폴더에도 복사 보관

# key.properties 파일 생성 (git에 포함하지 않음!)
cat > android/key.properties << EOF
storePassword=your-store-password
keyPassword=your-key-password
keyAlias=fortunova
storeFile=/Users/yourname/fortunova-release-key.jks
EOF

# .gitignore에 추가
echo "android/key.properties" >> .gitignore
echo "*.jks" >> .gitignore
```

### 3.3 Android 빌드 설정

```groovy
// android/app/build.gradle

// 서명 설정 추가
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    namespace "com.fortunova.app"
    compileSdkVersion 34

    defaultConfig {
        applicationId "com.fortunova.app"
        minSdkVersion 23        // Android 6.0+
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
    }

    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true      // 코드 축소
            shrinkResources true    // 리소스 축소
        }
    }
}
```

### 3.4 Android 빌드 & 업로드

```bash
# AAB (Android App Bundle) 빌드 — Google Play 권장 형식
flutter build appbundle --release

# 결과물: build/app/outputs/bundle/release/app-release.aab

# Google Play Console (https://play.google.com/console)에서:
# 1. 앱 생성 → "Fortunova" 입력
# 2. 프로덕션 > 새 릴리스 > app-release.aab 업로드
# 3. 스토어 등록정보 작성 (앱 설명, 스크린샷, 아이콘)
# 4. 콘텐츠 등급 설문 완료
# 5. 가격 및 배포 → 무료 (인앱 결제 포함)
# 6. 검토 제출 → 보통 수 시간~1일 내 승인
```

### 3.5 베타 배포 (Phase 3~4)

```bash
# Firebase App Distribution으로 APK 배포 (Google Play 심사 없이)
flutter build apk --release
# 결과물: build/app/outputs/flutter-apk/app-release.apk

# Firebase Console > App Distribution에서 APK 업로드
# 테스터 이메일 추가 → 설치 링크 자동 발송
```

---

## 4. iOS 배포

iOS가 가장 복잡하다. **Xcode 없이 Codemagic으로 해결하는 전략.**

### 4.1 256GB 전략: Xcode 없이 iOS 빌드하기

```
일반적인 방법:
  맥미니에 Xcode 설치 (30GB) → 로컬 빌드 → 업로드

Fortunova 전략 (256GB SSD 보호):
  맥미니에 Xcode 설치 안 함 → Codemagic 클라우드가 빌드 → 자동 업로드

  ┌─────────┐     ┌──────────┐     ┌───────────────┐
  │ git push │────→│ Codemagic│────→│ App Store     │
  │ (GitHub) │     │ (빌드)   │     │ Connect       │
  └─────────┘     └──────────┘     │ (TestFlight)  │
                                   └───────────────┘
```

### 4.2 iOS 인증서 & 프로비저닝 (최초 1회, 웹에서)

Xcode 없이도 Apple Developer 웹사이트에서 모든 인증서를 생성할 수 있다.

```
Step 1: Apple Developer 웹사이트 (developer.apple.com)

Step 2: Certificates, Identifiers & Profiles
  ├─ Identifiers > App ID 등록
  │   Bundle ID: com.fortunova.app
  │   Capabilities: Push Notifications 활성화
  │
  ├─ Certificates > iOS Distribution Certificate 생성
  │   (CSR 파일은 맥미니 키체인에서 생성)
  │
  └─ Profiles > App Store Distribution Profile 생성
      App ID: com.fortunova.app
      Certificate: 위에서 만든 Distribution 인증서
```

**CSR 생성 (맥미니에서, Xcode 불필요)**:
```bash
# 키체인 접근 → 인증서 지원 → 인증 기관에서 인증서 요청
# 또는 터미널에서:
openssl req -nodes -newkey rsa:2048 \
  -keyout fortunova_ios.key \
  -out fortunova_ios.csr \
  -subj "/CN=Fortunova/C=KR"

# CSR 파일을 Apple Developer에 업로드 → 인증서 다운로드
```

### 4.3 Codemagic에 인증서 등록

```
Codemagic 웹 (codemagic.io):
  1. GitHub 연동 → fortunova_app 리포지토리 선택
  2. Settings > Code signing > iOS
     ├─ Distribution Certificate (.p12) 업로드
     ├─ Provisioning Profile (.mobileprovision) 업로드
     └─ App Store Connect API Key 등록
  3. Build triggers > main 브랜치 push 시 자동 빌드 (또는 수동)
```

### 4.4 Codemagic 빌드 설정

```yaml
# codemagic.yaml (프로젝트 루트에 생성)

workflows:
  ios-release:
    name: iOS Release
    max_build_duration: 60
    instance_type: mac_mini_m2  # Codemagic의 M2 Mac 사용
    
    environment:
      ios_signing:
        distribution_type: app_store
        bundle_identifier: com.fortunova.app
      vars:
        APP_STORE_CONNECT_KEY_IDENTIFIER: $APP_STORE_KEY_ID
        APP_STORE_CONNECT_ISSUER_ID: $APP_STORE_ISSUER_ID
        APP_STORE_CONNECT_PRIVATE_KEY: $APP_STORE_PRIVATE_KEY
      flutter: stable
    
    scripts:
      - name: Flutter dependencies
        script: flutter pub get
      
      - name: Install CocoaPods
        script: |
          cd ios && pod install
      
      - name: Flutter build iOS
        script: |
          flutter build ipa --release \
            --build-number=$(($(app-store-connect get-latest-testflight-build-number "$APP_ID") + 1))
    
    artifacts:
      - build/ios/ipa/*.ipa
    
    publishing:
      app_store_connect:
        auth: integration
        submit_to_testflight: true    # TestFlight에 자동 업로드
        # submit_to_app_store: true   # 출시 시 활성화

  android-release:
    name: Android Release
    max_build_duration: 30
    instance_type: mac_mini_m2
    
    environment:
      android_signing:
        - fortunova_keystore
      vars:
        GOOGLE_PLAY_SERVICE_ACCOUNT: $GOOGLE_PLAY_CREDENTIALS
      flutter: stable
    
    scripts:
      - name: Flutter build Android
        script: flutter build appbundle --release
    
    artifacts:
      - build/app/outputs/bundle/release/*.aab
    
    publishing:
      google_play:
        credentials: $GOOGLE_PLAY_CREDENTIALS
        track: internal    # 내부 테스트 → production으로 변경
```

### 4.5 iOS 배포 단계별 진행

```
[Phase 3~4: 베타]
  Codemagic → TestFlight 자동 업로드
  → 테스터에게 TestFlight 앱 설치 안내
  → 외부 테스터 최대 10,000명

[Phase 5: 출시]
  Codemagic → App Store Connect 자동 업로드
  → 앱 심사 제출 (수동으로 "심사 제출" 버튼)
  → 심사 기간: 보통 24~48시간 (첫 제출은 더 걸릴 수 있음)
```

### 4.6 App Store 심사 주의사항

| 리젝 사유 | 대응 |
|----------|------|
| **"미신/점술 앱"** 경고 | 앱 설명에 "엔터테인먼트 목적" 명시, 면책 문구 포함 |
| 구독 가이드라인 위반 | 무료 체험 기간/가격/갱신 조건 명확히 표시 |
| 개인정보 수집 미고지 | App Privacy 정확히 작성 (생년월일 수집 고지) |
| 최소 기능 미달 | "이 앱은 웹사이트를 감싼 것이 아닌가?" → 네이티브 기능 강조 |
| 푸시 알림 오용 | 마케팅 푸시가 아닌 콘텐츠 알림임을 설명 |

### 4.7 나중에 Xcode가 필요해지면?

Phase 6 이후 Codemagic 무료 500분이 부족해지거나, 로컬 디버깅이 필요하면:

```
옵션 A: Codemagic 유료 (월 ~$40) — SSD 절약 유지
옵션 B: 맥미니에 Xcode 설치 — SSD 30GB 사용
옵션 C: Worker 맥미니에 Xcode 설치 — 여유 227GB이므로 부담 없음
```

Worker 맥미니(여유 227GB)에 Xcode를 설치하는 것이 가장 현실적이다.

---

## 5. Web 배포

가장 간단하다.

### 5.1 빌드

```bash
flutter build web --release

# 결과물: build/web/
# ├── index.html
# ├── main.dart.js
# ├── assets/
# └── ...
```

### 5.2 Cloudflare Pages 배포

```bash
# 방법 1: Cloudflare Pages에 직접 연결 (GitHub 연동)
# Cloudflare Dashboard > Pages > Create > Connect to Git
# Build command: flutter build web --release
# Build output directory: build/web

# 방법 2: CLI로 수동 배포
npm install -g wrangler
wrangler pages deploy build/web --project-name=fortunova
```

배포 URL: `fortunova.pages.dev` 또는 커스텀 도메인 `app.fortunova.app`

### 5.3 Web 버전의 용도

| Phase | Web 용도 |
|-------|---------|
| Phase 0~4 | 랜딩페이지 (별도, Framer/Carrd) |
| Phase 5 | **앱 미리보기** — "설치 전에 웹에서 체험" |
| Phase 6+ | **PC에서 심층 분석** — 월간 리포트 등 |
| Phase 8 | **웹 대시보드** — 풀 기능 웹 앱 |

MVP 출시 시 Web은 "맛보기 체험판" 수준 — 데일리 운세 확인만 가능하고, 전체 기능은 앱 설치 유도.

### 5.4 Web 특화 설정

```dart
// lib/main.dart — 플랫폼별 분기
import 'package:flutter/foundation.dart' show kIsWeb;

if (kIsWeb) {
  // Web: 앱 설치 유도 배너 표시
  // Web: Push 알림 대신 이메일 알림 제안
  // Web: RevenueCat 대신 Stripe 결제 (또는 결제 미지원)
}
```

Web에서는 RevenueCat(앱스토어 결제)이 작동하지 않으므로, MVP에서는 Web 결제를 지원하지 않고 앱 설치를 유도한다. Phase 6 이후 Stripe 연동으로 웹 결제를 추가할 수 있다.

---

## 6. CI/CD 파이프라인 (Codemagic)

### 6.1 전체 워크플로우

```
[개발자가 코드 push]
     │
     ├─ main 브랜치 → Production 빌드
     │   ├─ iOS: Codemagic → App Store Connect
     │   ├─ Android: Codemagic → Google Play (또는 로컬)
     │   └─ Web: GitHub Actions → Cloudflare Pages
     │
     ├─ develop 브랜치 → Beta 빌드
     │   ├─ iOS: Codemagic → TestFlight
     │   └─ Android: Codemagic → Firebase App Distribution
     │
     └─ feature/* 브랜치 → 빌드 안 함 (로컬 테스트만)
```

### 6.2 Codemagic 무료 티어 관리

| 항목 | 무료 한도 | Fortunova 예상 사용 |
|------|----------|-------------------|
| 빌드 시간 | 500분/월 | iOS 15분 + Android 10분 = ~25분/빌드 |
| 월 빌드 횟수 | ~20회 가능 | Phase 3~4: 주 1~2회면 충분 |

Phase 5 출시 후 배포 빈도가 올라가면:
- 옵션 A: Android는 로컬 빌드 → Codemagic은 iOS 전용 (시간 절약)
- 옵션 B: Codemagic 유료 ($40/월, M4 Mac 사용 가능)

### 6.3 버전 관리 전략

```
버전 형식: MAJOR.MINOR.PATCH+BUILD
예: 1.0.0+1, 1.0.1+2, 1.1.0+10

MAJOR: 대규모 변경 (Phase 전환 시)
MINOR: 기능 추가 (궁합, 리포트 등)
PATCH: 버그 수정
BUILD: 스토어 업로드마다 +1 (자동 증가)

Phase별 버전:
  Phase 3 (Ultra MVP):  0.1.0 ~ 0.9.x (TestFlight/Firebase)
  Phase 4 (Beta):       0.9.0 ~ 0.9.x
  Phase 5 (출시):       1.0.0
  Phase 6 (성장):       1.1.0 ~ 1.x.x
```

---

## 7. Phase별 배포 전략

### Phase 3 (Ultra MVP, M7~M10)

```
목적: 30~50명 테스터에게 배포
방법:
  iOS   → Codemagic → TestFlight (테스터 이메일 초대)
  Android → 로컬 APK 빌드 → Firebase App Distribution
  Web   → 배포 안 함 (아직 불필요)
빈도: 주 1~2회 (버그 수정/개선 반영)
```

### Phase 4 (Beta, M10~M14)

```
목적: 100~200명 베타 테스터
방법:
  iOS   → Codemagic → TestFlight (외부 테스터 그룹)
  Android → Codemagic → Firebase App Distribution
  Web   → 배포 안 함
빈도: 주 1회
추가: RevenueCat 구독 결제 테스트 (Sandbox 환경)
```

### Phase 5 (출시, M14~M15)

```
목적: 앱스토어 정식 출시
방법:
  iOS   → Codemagic → App Store Connect → 심사 제출
  Android → Codemagic → Google Play Console → 프로덕션 트랙
  Web   → Cloudflare Pages 배포 (맛보기 체험판)
빈도: 출시 1회 → 이후 2주 1회 정기 업데이트
```

### Phase 5+ (운영)

```
정기 업데이트 사이클 (2주):
  Week 1: 개발 + QA
  Week 2 월: develop 브랜치 코드 프리즈
  Week 2 화: Beta 빌드 → 내부 테스트
  Week 2 수: main 머지 → Production 빌드
  Week 2 목: iOS 심사 제출 (24~48시간 소요)
  Week 2 금~토: Android + Web 배포
  Week 2 일: iOS 승인 확인 → 동시 출시
```

---

## 8. 배포 체크리스트

### 최초 출시 전 (Phase 5)

**공통**
- [ ] 앱 아이콘 준비 (1024×1024 원본)
- [ ] 스플래시 스크린 설정
- [ ] 앱 이름: "Fortunova"
- [ ] 개인정보 처리방침 URL 준비
- [ ] 이용약관 URL 준비

**Android**
- [ ] 서명 키스토어 생성 + NAS 백업
- [ ] Google Play Console 앱 생성
- [ ] 스토어 등록정보 (설명, 스크린샷 8장, 그래픽 이미지)
- [ ] 콘텐츠 등급 설문
- [ ] 앱 카테고리: 라이프스타일
- [ ] 가격: 무료 (인앱 구매 포함)
- [ ] 타깃 연령: 18세 이상
- [ ] AAB 빌드 + 업로드 + 검토 제출

**iOS**
- [ ] Apple Developer 등록 완료
- [ ] App ID + 인증서 + 프로비저닝 프로필 생성
- [ ] Codemagic 인증서 등록
- [ ] App Store Connect에서 앱 생성
- [ ] 스토어 등록정보 (설명, 스크린샷 6.7" + 6.5" 각 최소 3장)
- [ ] App Privacy 작성 (생년월일, 사용 데이터 명시)
- [ ] 연령 등급: 17+ (점술/운세 카테고리)
- [ ] 인앱 구매 상품 등록 (RevenueCat 연동)
- [ ] 심사 노트: "엔터테인먼트 목적, 면책 문구 포함" 명시
- [ ] IPA 빌드 + TestFlight 업로드 + 심사 제출

**Web**
- [ ] Cloudflare Pages 프로젝트 생성
- [ ] 커스텀 도메인 연결 (app.fortunova.app)
- [ ] SEO 메타태그 설정
- [ ] 모바일 앱 설치 유도 배너

### 매 업데이트 시

- [ ] 버전 번호 증가 (pubspec.yaml)
- [ ] CHANGELOG 작성
- [ ] develop에서 QA 통과 확인
- [ ] main 머지
- [ ] iOS: Codemagic 빌드 확인 → 심사 제출
- [ ] Android: AAB 빌드 → Google Play 업로드
- [ ] Web: Cloudflare Pages 자동 배포 확인
- [ ] 스토어 "새로운 기능" 텍스트 업데이트

---

## 부록: 자주 겪는 문제 & 해결

### "flutter build ios" 에러 (로컬에서)

로컬에 Xcode가 없으므로 `flutter build ios`는 실행할 수 없다. **반드시 Codemagic에서 빌드.**

로컬에서 iOS 관련 작업이 필요한 경우:
```bash
# iOS 시뮬레이터도 Xcode 없이는 불가
# 대안: Android 에뮬레이터 + Web 브라우저에서 테스트
# iOS 특화 UI는 TestFlight 배포 후 실기기에서 확인
```

### Google Play "앱 서명" 혼란

Google Play는 2021년부터 "Google Play App Signing"을 강제한다:
```
개발자 키 (upload key) → Google Play에 AAB 업로드
Google Play가 자체 키로 최종 서명 → 사용자에게 배포

즉, keytool로 만든 키는 "업로드 키"이고 최종 서명 키는 Google이 관리.
업로드 키를 분실해도 Google에 요청하여 재설정 가능.
```

### Codemagic 빌드 실패 시

```
흔한 원인:
  1. iOS 인증서 만료 → Apple Developer에서 갱신 후 재등록
  2. CocoaPods 버전 충돌 → Podfile.lock 삭제 후 재빌드
  3. Flutter 버전 불일치 → codemagic.yaml에서 flutter: stable 확인
  4. 빌드 시간 초과 → max_build_duration 늘리기

디버깅: Codemagic 웹 UI에서 빌드 로그 전체 확인 가능
```

### RevenueCat 인앱 구독 테스트

```
iOS: App Store Connect > Sandbox 테스터 계정 생성 → TestFlight에서 테스트
Android: Google Play Console > 라이선스 테스트 계정 등록 → 내부 테스트 트랙

주의: 실제 결제가 발생하지 않는 Sandbox 환경에서 반드시 먼저 테스트!
RevenueCat Dashboard에서 Sandbox 모드 활성화 확인.
```

---

> **이 가이드는 Phase 3(Ultra MVP) 시작 시점에 실행합니다.**  
> Phase 0~2는 서버(FastAPI) 개발이 중심이므로 Flutter 배포가 불필요합니다.  
> 맥미니 구매 및 Flutter 환경 구축은 Phase 1(M2~M4)에서 진행합니다.
