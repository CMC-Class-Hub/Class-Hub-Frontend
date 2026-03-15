# 🎓 Class Hub Frontend (클래스 허브 프론트엔드)

**수강생을 위한 클래스 상세 조회, 수강 신청 및 예약/결제 관리 서비스입니다.**
Next.js 16 (App Router)를 기반으로 구축되었으며, 수강생이 빠르고 편리하게 클래스를 탐색하고 예약할 수 있는 최적화된 인터페이스를 제공합니다.

---

## ✨ 핵심 기능 (Key Features)

* **클래스 조회 및 수강 신청**: 수강생이 클래스의 상세 정보(일정, 커리큘럼, 강사 정보 등)를 확인하고 원하는 클래스를 신청할 수 있습니다.
* **내 예약 관리**: 신청한 클래스의 예약 상태(대기중, 확정, 취소 등)를 쉽게 확인하고 관리할 수 있습니다.
* **통합 결제 시스템**: 예약된 클래스에 대한 결제를 안전하게 진행할 수 있습니다.
* **출석 체크**: 개인별 예약 번호를 바탕으로 빠르고 간편하게 출석을 인증할 수 있습니다.
* **유연한 API 모드**: 백엔드 서버 없이도 프론트엔드 개발을 바로 진행할 수 있는 **Mock API** 모드가 내장되어 있어 빠른 UI/UX 개발이 가능합니다.
* **에러 로깅 및 모니터링**: Sentry 연동을 통해 예상치 못한 런타임 에러를 실시간으로 추적하고 대응합니다.

---

## 🛠 기술 스택 (Tech Stack)

### Core
* **Framework**: Next.js 16 (App Router)
* **Language**: TypeScript
* **Library**: React 19

### Styling & UI
* **CSS Framework**: Tailwind CSS 4
* **UI Components**: shadcn/ui (Radix UI 기반)
* **Icons**: Lucide React
* **Address Search**: react-daum-postcode

### Monitoring & Quality
* **Error Tracking**: Sentry (`@sentry/nextjs`)
* **Linting**: ESLint

---

## 📂 프로젝트 구조 (Project Structure)

```text
Class-Hub-Frontend/
├── app/                      # Next.js App Router (페이지 및 레이아웃)
│   ├── class/                # 클래스 상세 정보 및 수강 신청 페이지
│   ├── reservations/         # 내 예약 목록 조회 페이지
│   ├── payment/              # 결제 처리 및 완료 페이지
│   └── attendance/           # 예약별 수강생 출석 체크 페이지
├── components/               # 재사용 가능한 UI 컴포넌트 모음
│   ├── features/             # 도메인 제약이 있는 특정 기능별 컴포넌트
│   └── ui/                   # 도메인 독립적인 공통 UI 컴포넌트 (shadcn/ui 등)
├── lib/
│   └── api/                  # API 통신 로직 및 설정
│       ├── mock/             # 환경 변수에 따라 동작하는 Mock API 구현체 (더미 데이터)
│       ├── real/             # 실제 서버와 통신하는 Real API 구현체
│       └── api-config.ts     # Mock / Real API 스위칭 및 설정 관리
├── public/                   # 정적 이미지 및 에셋 리소스
└── next.config.ts            # Next.js 및 Sentry 설정 파일
```

---

## 🚀 시작하기 (Getting Started)

### 1. 프로젝트 클론 및 의존성 설치

```bash
# 의존성 설치
npm install
# 또는
yarn install
```

### 2. 환경 변수 설정 (.env.local)

프로젝트 루트 디렉토리에 `.env.local` 파일을 생성(또는 복사)하여 필요한 환경 변수를 설정합니다.

```env
# 1. 백엔드 API 주소 (실제 서버 연동 시 사용)
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:8080

# 2. API 모드 설정 
# (true: Mock API 사용 / false: 실제 서버 API 사용)
# 기본값은 true로 설정되어 있어 별도의 백엔드 없이 바로 실행 가능합니다.
NEXT_PUBLIC_USE_MOCK=true
```

> **Note**: 본 프로젝트는 개발 편의성을 위해 기본적으로 **Mock API** 모드로 동작합니다. 실제 백엔드 서버(`API_URL`)와 연동하여 개발 및 테스트를 하려면 `NEXT_PUBLIC_USE_MOCK`을 `false`로 변경하세요.

### 3. 개발 서버 실행

```bash
# 개발 서버 실행 (package.json 설정에 따라 3001 포트 사용)
npm run dev
# 또는
yarn dev
```

터미널에 안내된 URL ([http://localhost:3001](http://localhost:3001))을 브라우저에서 열어 애플리케이션을 확인합니다.

---

## 🔌 API 개발 환경 가이드

본 프로젝트는 두 가지 API 통신 모드를 지원하여 유연한 개발을 돕습니다:

1. **Mock API 모드 (`NEXT_PUBLIC_USE_MOCK=true`)**
   * 프로젝트 내부에 구축된 `lib/api/mock/` 폴더의 가짜(Dummy) 데이터와 지연 시간을 제공하여 실제 서버가 있는 것처럼 동작합니다.
   * 브라우저의 전역 상태나 `localStorage` 등을 임시 활용하여 CRUD 테스트가 가능하며, 화면 UI/UX 개발에 집중할 때 유용합니다.

2. **Real API 모드 (`NEXT_PUBLIC_USE_MOCK=false`)**
   * 설정된 `NEXT_PUBLIC_BACKEND_API_URL`을 Base URL로 실제 백엔드 API 서버와 HTTP 통신(`fetch` 등)을 수행합니다.
   * 서버와의 연동 테스트 및 실 운영(Production) 환경에 배포 시 사용합니다.

---

## 🐛 에러 모니터링 (Sentry)

생태계의 안정성과 버그의 빠른 패치를 위해 Sentry 모니터링이 연동되어 있습니다. 
* 클라이언트, 모서리(Edge), 서버 구동 등 Next.js 전반에서 발생하는 예외를 모두 추적합니다.
* `sentry.*.config.ts` 파일과 `instrumentation.ts` 매커니즘을 통해 환경별 초기화 로직이 동작합니다.
* 프로덕션 빌드 및 배포 시, Sentry 인증 정보 및 DSN 등이 적절하게 세팅되어야 원활한 기능 동작을 보장할 수 있습니다.
