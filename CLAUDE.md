# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 명령어

```bash
# 개발 서버 실행
pnpm dev

# 빌드
pnpm build

# 린트
pnpm lint

# 빌드 결과 미리보기
pnpm preview
```

> **패키지 매니저는 반드시 pnpm을 사용한다. npm/yarn 사용 금지.**

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| Language | TypeScript 5.9.3 |
| UI | React 19.2.0 |
| 빌드 도구 | Vite 7.3.1 |
| 패키지 매니저 | pnpm |
| 린터 | ESLint (React hooks + TypeScript 규칙) |

---

## 서비스 개요

**Randsome** — 상명대학교 축제 기간 이성 랜덤 매칭 서비스.

상명대학교 재학생 및 휴학생(19학번 이상, `@sangmyung.kr` 이메일 인증)만 이용 가능하다.

### 사용자 유형

| 유형 | 설명 |
|------|------|
| 비회원 (Guest) | 메인 페이지 및 최근 매칭 소식 열람, 회원가입 가능 |
| 회원 (Member) | 매칭 후보 등록, 매칭 신청, 결과 열람, 프로필 수정 |
| 관리자 (Admin) | 회원·후보·매칭·결제 전반 관리 |

---

## 주요 기능 흐름

### 매칭 후보 등록
회원이 등록 신청 → 계좌 송금 → 관리자 입금 확인 후 승인 → 후보 리스트 등록

- 후보자 상태에서 재등록 불가
- 등록 취소 시 환불 불가

### 매칭 신청
매칭 방식 선택(무작위/이상형 기반) → 인원 선택(1~5명) → 계좌 송금 → 관리자 승인 → 매칭 결과 열람 가능

- `무작위 매칭`: 성별이 다른 후보자 중 랜덤 선택
- `이상형 기반 매칭`: 이상형 내용 기반 추천 알고리즘으로 선택

### 메인 피드 (비회원 열람 가능)
- `"OOO님이 매칭 후보로 등록되었습니다!"`
- `"OOO님이 사랑을 찾기 위해 N명을 요청하였습니다!"`

---

## 백엔드 연동

백엔드: `randsome-back` (Spring Boot 3.5.x, Java 21)

### 핵심 도메인

| 도메인 | 설명 |
|--------|------|
| Member | role: `ROLE_MEMBER` / `ROLE_CANDIDATE` / `ROLE_ADMIN` |
| CandidateRegistration | 후보 등록 신청. status: `PENDING` / `APPROVED` / `REJECTED` |
| MatchingRequest | type: `RANDOM` / `IDEAL`, 1~5명. status: `PENDING` / `APPROVED` / `REJECTED` |
| MatchingResult | 결제 + 관리자 승인 후 열람 가능 |
| Payment | 계좌이체. status: `WAITING` / `CONFIRMED` / `FAILED` |

### 결제 흐름
계좌 이체 → 관리자 수동 확인 → `Payment.CONFIRMED` → 매칭 신청 `PENDING` → 관리자 최종 승인 → 매칭 실행

### 가격 정책
- RANDOM: 인당 1,000원
- IDEAL: 인당 1,500원

### 송금 안내 (UI에 반드시 표시)
- 정확한 금액을 한 번에 입금 (분할 송금 불가)
- 신청자 이름 = 입금자명 일치 필요
- 관리자 승인까지 최대 약 10분 소요
- 잘못된 계좌 송금 책임은 본인에게 있음
- 환불 불가

---

## 매칭 신청 내역 화면

신청 내역은 두 섹션으로 구분한다:
- **승인 대기 중**: 매칭 결과 조회 불가
- **승인 완료**: 매칭 결과 조회 가능

---

## 기능 개발 플로우

기능 개발 순서 → [ROADMAP.md](./ROADMAP.md) 참고

---

## 개발 원칙

백엔드와 동일하게 켄트 벡 증강 코딩(Tidy First / TDD) 원칙을 따른다.
- TDD 사이클: Red → Green → Refactor
- 구조 변경(리팩터링)과 동작 변경(기능 추가)을 하나의 커밋에 섞지 않는다.
- YAGNI — 현재 필요한 것만 구현한다.

---

## 폴더 구조

```
src/
├── assets/          # 정적 파일 (이미지, 폰트 등)
├── components/      # 재사용 가능한 공통 컴포넌트
│   └── ui/          # Button, Input, Modal 등 원자 단위 UI
├── pages/           # 라우트 단위 페이지 컴포넌트
├── features/        # 도메인별 기능 모듈 (auth, matching, admin …)
│   └── [domain]/
│       ├── components/   # 해당 도메인 전용 컴포넌트
│       ├── hooks/        # 해당 도메인 전용 커스텀 훅
│       └── api.ts        # 해당 도메인 API 호출 함수
├── hooks/           # 전역 커스텀 훅
├── lib/             # API 클라이언트, 유틸리티
├── store/           # 전역 상태 (인증 등)
├── types/           # 공통 TypeScript 타입 정의
└── router.tsx       # 라우팅 설정
```

---

## 네이밍 컨벤션

| 대상 | 형식 | 예시 |
|------|------|------|
| 컴포넌트 파일 | PascalCase | `MatchingCard.tsx` |
| 훅 파일 | camelCase, `use` 접두사 | `useMatchingResult.ts` |
| 유틸/헬퍼 파일 | camelCase | `formatPrice.ts` |
| 타입/인터페이스 | PascalCase | `MatchingRequest`, `ApiResponse<T>` |
| 상수 | UPPER_SNAKE_CASE | `MAX_MATCHING_COUNT` |
| CSS 클래스 | kebab-case (Tailwind 사용 시 제외) | `matching-card__title` |

---

## TypeScript 코드 스타일

- `any` 사용 금지 — `unknown` + 타입 가드로 대체한다.
- 함수 반환 타입을 명시한다 (추론 가능해도 public API는 명시).
- `interface`는 객체 형태, `type`은 유니온·교차·유틸리티 타입에 사용한다.
- API 응답 타입은 별도 `types/` 파일에 정의한다.
- Non-null assertion(`!`) 사용을 최소화하고, 옵셔널 체이닝(`?.`)을 우선한다.

```ts
// Bad
const name = user!.name;

// Good
const name = user?.name ?? '이름 없음';
```

---

## React 컴포넌트 설계 원칙

- **단일 책임**: 컴포넌트 하나는 하나의 역할만 담당한다.
- **Props drilling 3단계 초과 시** 전역 상태 또는 Context로 분리한다.
- 비즈니스 로직은 커스텀 훅(`useXxx`)으로 분리한다 — JSX는 렌더링만 담당한다.
- 컴포넌트 내부에 인라인 객체/배열 리터럴을 props로 전달하지 않는다 (불필요한 리렌더링 유발).

```tsx
// Bad — 매 렌더마다 새 객체 생성
<Card style={{ marginTop: 8 }} />

// Good
const cardStyle = { marginTop: 8 };
<Card style={cardStyle} />
// 또는 Tailwind className 사용
```

- 조건부 렌더링은 삼항 연산자보다 **얼리 리턴** 또는 **논리 AND(`&&`)** 를 선호한다.

```tsx
// Bad
return loading ? <Spinner /> : <Content />;

// Good (얼리 리턴)
if (loading) return <Spinner />;
return <Content />;
```

---

## 성능 최적화

### 메모이제이션
- `React.memo`: 동일 props에서 리렌더링이 불필요한 순수 컴포넌트에만 적용한다.
- `useMemo`: 계산 비용이 높은 값에만 사용한다 (단순 연산에는 사용하지 않는다).
- `useCallback`: 자식 컴포넌트에 함수를 props로 넘길 때 사용한다.

```ts
// 계산 비용이 낮으면 useMemo 불필요
const doubled = value * 2; // useMemo 오히려 overhead

// 비용이 높은 경우
const sorted = useMemo(() => heavySort(list), [list]);
```

### 코드 스플리팅
- 라우트 단위로 `React.lazy` + `Suspense`를 적용한다.

```tsx
const MatchingPage = React.lazy(() => import('@/pages/MatchingPage'));
```

### API 호출
- 서버 상태는 **TanStack Query** (`useQuery` / `useMutation`)로 관리한다.
- `staleTime`을 적절히 설정해 불필요한 재요청을 방지한다.
- 낙관적 업데이트(Optimistic Update)를 활용해 UX를 향상시킨다.

### 이미지
- `loading="lazy"` 속성을 기본으로 사용한다.
- WebP 포맷을 우선 사용한다.

---

## API 클라이언트 규칙

- axios 인스턴스를 하나만 생성하고 `src/lib/axios.ts`에서 export한다.
- 요청/응답 인터셉터에서 토큰 첨부 및 401 갱신을 처리한다.
- API 함수는 도메인별 `features/[domain]/api.ts`에 작성한다.
- 에러 응답은 인터셉터에서 공통 처리한다 (`Toast` 등).

```ts
// features/matching/api.ts
export const requestMatching = (body: MatchingRequestBody) =>
  apiClient.post<MatchingRequest>('/matching/requests', body);
```

---

## 에러 핸들링

- API 에러는 `try/catch`보다 TanStack Query의 `onError` / `throwOnError`를 활용한다.
- 페이지 단위 에러 경계(`ErrorBoundary`)를 설정한다.
- 사용자에게 노출하는 에러 메시지는 서버 응답 그대로 출력하지 않고, UI용 메시지로 변환한다.

---

## 접근성 (a11y)

- 인터랙티브 요소(`<button>`, `<a>`)에는 반드시 명확한 텍스트 또는 `aria-label`을 제공한다.
- 폼 `<input>`에는 `<label>`을 연결한다 (`htmlFor` + `id`).
- 색상만으로 상태를 전달하지 않는다 (아이콘 또는 텍스트 병행).
