# Class Hub Frontend

수강생을 위한 클래스 신청 및 예약 관리 서비스입니다.
Next.js 16 (App Router)를 기반으로 구축되었으며, 수강생이 신청 링크를 통해 클래스를 조회하고 예약 신청 및 확인을 할 수 있는 기능을 제공합니다.

## 🚀 시작하기 (Getting Started)

### 1. 프로젝트 설치

```bash
# 의존성 설치
npm install
# 또는
yarn install
```

### 2. 환경 변수 설정 (선택 사항)

백엔드 서버와 연동하거나 API 모드를 변경하려면 `.env.local` 파일을 생성하여 아래 변수를 설정하세요.

```env
# 1. 백엔드 API 주소 (기본값: http://localhost:8080)
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:8080

# 2. API 모드 설정 (true: Mock API 사용, false: 실제 서버 API 사용)
# 기본값은 true(Mock)이므로, 실제 서버를 사용할 때만 false로 설정하세요.
NEXT_PUBLIC_USE_MOCK=false
```


### 3. 개발 서버 실행

```bash
npm run dev
# 또는
yarn dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 결과를 확인하세요.

## 🛠 기술 스택 (Tech Stack)

*   **Framework**: Next.js 16 (App Router)
*   **Language**: TypeScript
*   **Library**: React 19
*   **Styling**: Tailwind CSS 4, shadcn/ui
*   **Icons**: Lucide React

## 🔌 API 개발 환경 가이드

이 프로젝트는 백엔드 서버가 없어도 프론트엔드 개발을 진행할 수 있도록 **Mock API** 시스템이 내장되어 있습니다.
기본적으로 **Mock API 모드**로 동작하므로 별도의 설정 없이 바로 개발을 시작할 수 있습니다.

### 1. Mock API 모드 (기본값)
*   **설정**: 별도 설정 불필요 (또는 `.env.local`에서 `NEXT_PUBLIC_USE_MOCK=true`)
*   **동작**: 브라우저의 `localStorage`를 사용하여 데이터 관리
*   **용도**: UI/UX 개발, 테스트, 데모 실행

### 2. Real API 모드
*   **설정**: `.env.local` 파일에서 `NEXT_PUBLIC_USE_MOCK=false` 로 설정
*   **동작**: 실제 백엔드 서버(`API_URL`)와 HTTP 통신
*   **용도**: 백엔드 서버 연동 및 실제 운영 환경

## 📂 프로젝트 구조 (Project Structure)

```
.
├── app/                    # Next.js App Router (페이지 및 레이아웃)
│   ├── class/              # 클래스 상세 및 신청 페이지
│   └── reservations/       # 내 예약 확인 페이지
├── components/             # UI 컴포넌트
│   ├── features/           # 도메인별 기능 단위 컴포넌트
│   └── ui/                 # 공통 UI 컴포넌트 (shadcn/ui 등)
├── lib/
│   └── api/                # API 통신 로직
│       ├── mock/           # Mock API 구현체 (가짜 데이터)
│       ├── real/           # Real API 구현체 (서버 통신)
│       └── api-config.ts   # 환경 변수에 따른 API 모드 스위칭 설정
└── public/                 # 정적 리소스
```
