# Fitco

Fitco 프로젝트는 Turborepo 기반으로 구축된 넥스트제이에스(Next.js) 모노레포(Monorepo) 애플리케이션입니다.

## 📖 프로젝트 소개 (About)

Fitco는 **Cafe24 기반 쇼핑몰을 위한 B2B SaaS 솔루션**입니다. 
주요 타겟은 패션 커머스 쇼핑몰들이며, 주요 기능은 다음과 같이 구성되는 것으로 보입니다:

- **데이터 수집 및 분석 (크롤링 & AI)**: 자동화된 크롤링과 OpenAI를 활용하여 입점 쇼핑몰의 세트 상품, 사이즈, 이미지 등의 데이터를 추출하고 분석합니다.
- **Cafe24 인테그레이션**: Cafe24 REST API와 연동하여 상품(Product) 정보, 옵션(Variant), 카트(Cart), 주문(Order), 고객(Customer) 데이터를 연동 및 처리합니다.
- **어드민 백오피스 (`apps/admin`)**: 등록된 쇼핑몰(Mall) 관리 및 연동 상태, 크롤링된 데이터 검수를 위한 중앙 관리자용 웹 대시보드를 제공합니다.
- **프론트엔드 위젯 (`widget.js`)**: 쇼핑몰 상점에 직접 삽입되는 스크립트 기반 위젯으로, 고객에게 사이즈 추론 기능이나 추천 시스템을 제공합니다.
- **알림 및 고객 관리**: 네이버 클라우드(SENS, 알림톡) 및 Resend API를 통해 알림톡, SMS, 이메일 등의 메시지를 발송합니다.

---
## 🏗️ 프로젝트 구조 (Architecture)

프로젝트는 `apps`와 `packages`로 분리되어 관리됩니다.

- **apps/admin**: 어드민 백오피스 웹 애플리케이션 (Next.js 15, React 19, Tailwind CSS)
- **packages/database**: 공통 데이터베이스 스키마 및 ORM 설정 (Drizzle ORM, PostgreSQL)
- **packages/design-system**: 프로젝트 전반에서 사용되는 공통 UI 컴포넌트
- **packages/email**: 이메일 발송 관련 모듈 (Resend)
- **packages/analytics**: 데이터 분석 추적 관련 모듈 (Google Analytics 등)
- **그 외 기타 패키지**: `next-config`, `seo`, `typescript-config` 등 프로젝트 설정 공유

---

## 🚀 온보딩 가이드 (Getting Started)

프로젝트를 로컬 환경에서 실행하기 위한 필수 세팅 과정입니다.

### 1. 환경 변수 설정
루트 디렉토리에 정의된 `.env.example` 파일을 복사하여 `.env` 파일을 생성하고 내부 값을 채웁니다.
```bash
cp .env.example .env
```

### 2. 의존성 패키지 설치
이 프로젝트는 패키지 매니저로 `pnpm`을 사용합니다.
```bash
pnpm install
```

### 3. 데이터베이스 마이그레이션
Drizzle ORM을 통해 정의된 스키마를 실제 데이터베이스에 푸시합니다. (사전에 `.env`에 `DATABASE_URL`이 올바르게 설정되어 있어야 합니다.)
```bash
pnpm migrate
```

### 4. 로컬 개발 서버 실행
설정이 모두 마무리되었다면 아래 명령어로 서버를 구동합니다.
```bash
# 전체 워크스페이스(apps)의 개발 서버 실행
pnpm dev

# Admin 서버만 단독으로 실행하고 싶은 경우
pnpm admin
```

---

## 🛠 주요 스크립트 명령어

루트 `package.json`에서 제공되는 주요 명령어입니다.
- `pnpm build`: 프로덕션용 전체 프로젝트 빌드
- `pnpm lint` & `pnpm format`: 코드 퀄리티(Lint) 및 포맷팅 검사
- `pnpm test`: 단위 테스트 실행
- `pnpm analyze`: 번들 사이즈 분석 모드
- `pnpm clean`: `node_modules` 완전 삭제 및 초기화

---

## 🚀 배포 가이드 (Deployment)

아래의 빌드 절차를 따릅니다.

```bash
# 1. 프로덕션 빌드 (Standalone 결과물 생성)
pnpm build --filter admin

# 2. 빌드 결과물이 모인 .next/standalone 폴더를 활용해 Node 서버로 실행
node apps/admin/.next/standalone/server.js
```

---

## 📝 이슈 및 TODO

### 이슈 (Issues)
- 세트상품 사이즈 추출 처리

### 할 일 (TODO)
- 크롤링 시 위젯 analytics 무시
- mall refreshToken 만료 전 서버에서 갱신

### 테스트 내역 [2025-09-01]
- 참고 문서: [Notion MVP Task](https://www.notion.so/clikker/MVP-2317554b2c1a804fa49bfe7242505f41)
- 무아무아: 이미지
- 팜므뮤즈: 사이즈 없음
- 로미스토리: `page.goto` 부터 에러 발생
- 파티수: 카페24 몰 아님
- 제이엘프: 이미지