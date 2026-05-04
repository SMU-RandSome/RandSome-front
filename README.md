# Randsome

상명대학교 축제 기간 이성 랜덤 매칭 서비스 프론트엔드

## 기술 스택

| 분류 | 기술 |
|------|------|
| Language | TypeScript 5.9 |
| UI | React 19 |
| Build | Vite 7 |
| State | TanStack Query, Context API |
| Styling | Tailwind CSS |
| Animation | Motion (Framer Motion) |
| Test | Vitest, Testing Library |
| Package Manager | pnpm |

## 실행 방법

```bash
# 의존성 설치
pnpm install

# 개발 서버
pnpm dev

# 빌드
pnpm build

# 린트
pnpm lint

# 테스트
pnpm test:run
```

## 프로젝트 구조

```
src/
├── assets/          # 정적 파일
├── components/      # 공통 컴포넌트
│   ├── layout/      # MobileLayout, BottomNav, MobileHeader
│   └── ui/          # Button, Modal, FeedCard 등
├── features/        # 도메인별 기능 모듈
│   ├── auth/        # 인증 (로그인, 회원가입)
│   ├── attendance/  # 출석 체크
│   ├── matching/    # 매칭 신청/결과
│   ├── ticket/      # 티켓 관리
│   └── admin/       # 관리자 기능
├── hooks/           # 전역 커스텀 훅
├── lib/             # API 클라이언트, 유틸리티
├── pages/           # 라우트 단위 페이지
├── store/           # 전역 상태 (Auth, DisplayMode)
├── types/           # 공통 타입 정의
└── router.tsx       # 라우팅 설정
```

## 주요 기능

- 학교 이메일(@sangmyung.kr) 인증 기반 회원가입
- 무작위 / 이상형 기반 매칭 신청
- 티켓 시스템 (출석, QR 스캔, 쿠폰으로 획득)
- PWA 지원 (홈 화면 설치, 푸시 알림)
- 관리자 대시보드

## 환경 변수

```
VITE_API_BASE_URL=       # 백엔드 API 주소
VITE_FIREBASE_API_KEY=   # Firebase 설정 (푸시 알림)
```
