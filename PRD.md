# RandSome 서비스 PRD (Product Requirements Document)

> 버전: 1.0.0
> 기준 API: RandSome API Docs v1.0.0 (OpenAPI 3.1.0)
> 작성일: 2026-03-17

---

## 목차

1. [서비스 개요](#1-서비스-개요)
2. [사용자 유형 및 권한](#2-사용자-유형-및-권한)
3. [도메인별 API 목록](#3-도메인별-api-목록)
4. [핵심 도메인 모델](#4-핵심-도메인-모델)
5. [상태 흐름](#5-상태-흐름)
6. [프론트엔드 구현 시 필요한 특이사항](#6-프론트엔드-구현-시-필요한-특이사항)

---

## 1. 서비스 개요

**RandSome**은 상명대학교 축제 기간 이성 랜덤 매칭 서비스이다.

- 이용 대상: 상명대학교 재학생 및 휴학생 (`@sangmyung.kr` 이메일 보유자, 19학번 이상)
- 이메일 인증 → 회원가입 → 후보 등록 또는 매칭 신청 → 관리자 수동 결제 확인 → 매칭 결과 열람의 플로우로 운영된다.
- 결제는 계좌이체 방식이며, 관리자가 수동으로 입금 여부를 확인한다.
- 피드(최신 이벤트 목록)는 비회원도 열람 가능하다.

**서버 기본 URL**: `http://localhost:8080` (개발 환경)

---

## 2. 사용자 유형 및 권한

| 역할 (role) | 설명 | 주요 가능 행위 |
|---|---|---|
| `ROLE_MEMBER` | 일반 회원 | 후보 등록 신청, 매칭 신청, 프로필 조회/수정, 신청 내역 조회 |
| `ROLE_CANDIDATE` | 매칭 후보자 (관리자 승인 후 전환) | MEMBER와 동일. 추가로 후보 목록에 노출됨 |
| `ROLE_ADMIN` | 관리자 | 회원 목록/상세 조회, 결제 확정/거절, 대시보드 통계 조회 |
| 비회원 (Guest) | 미로그인 사용자 | 피드 조회, 이메일 인증, 회원가입, 로그인만 가능 |

**인증 방식**: JWT Bearer 토큰, Refresh Token 기반 재발급, 이메일 인증 완료 시 별도 인증 토큰 발급 (10분 유효)

---

## 3. 도메인별 API 목록

### 3-1. 인증 (Auth)

| 메서드 | 엔드포인트 | 설명 | JWT 필요 |
|---|---|---|---|
| `POST` | `/v1/auth/email/verification-codes` | 이메일 인증 코드 발송 (6자리, 5분 유효) | X |
| `POST` | `/v1/auth/email/verification-codes/verify` | 인증 코드 검증 → 인증 토큰 반환 (10분 유효) | X |
| `POST` | `/v1/auth/login` | 로그인 → Access/Refresh Token 반환 | X |
| `POST` | `/v1/auth/reissue` | Refresh Token으로 토큰 재발급 | X |

### 3-2. 회원 (Member)

| 메서드 | 엔드포인트 | 설명 | JWT 필요 |
|---|---|---|---|
| `POST` | `/v1/members/sign-up` | 회원가입 | X |
| `GET` | `/v1/members` | 내 프로필 조회 | O |
| `PATCH` | `/v1/members` | 내 프로필 수정 | O |

### 3-3. 후보 등록 (Candidate Registration)

| 메서드 | 엔드포인트 | 설명 | JWT 필요 |
|---|---|---|---|
| `POST` | `/v1/candidate-registrations` | 후보 등록 신청 | O |
| `POST` | `/v1/candidate-registrations/withdraw` | 후보 등록 철회 (승인된 후보자만, 환불 없음) | O |

### 3-4. 매칭 (Matching)

| 메서드 | 엔드포인트 | 설명 | JWT 필요 |
|---|---|---|---|
| `POST` | `/v1/matching` | 매칭 신청 (유형: RANDOM/IDEAL, 인원: 1~5명) | O |
| `POST` | `/v1/matching/applications/{applicationId}/withdraw` | 매칭 신청 철회 (PENDING만 가능) | O |
| `GET` | `/v1/matching/applications` | 내 신청 내역 조회 (status 필터) | O |
| `GET` | `/v1/matching/applications/{applicationId}/approved` | 승인된 신청의 매칭 결과 조회 | O |

### 3-5. 피드 / 통계 / 관리자

| 메서드 | 엔드포인트 | 설명 | JWT 필요 |
|---|---|---|---|
| `GET` | `/v1/feed` | 최신 피드 조회 (커서 기반 페이징) | X |
| `GET` | `/v1/statistics/dashboard` | 대시보드 통계 (후보 수, 매칭 신청 수) | 미명시 |
| `POST` | `/v1/admin/payments/{paymentId}/confirm` | 결제 확정 | O (Admin) |
| `POST` | `/v1/admin/payments/{paymentId}/reject` | 결제 거절 (거절 사유 필수) | O (Admin) |
| `GET` | `/v1/admin/members` | 회원 목록 조회 (페이지네이션) | O (Admin) |
| `GET` | `/v1/admin/members/{memberId}` | 회원 상세 조회 (계좌 정보 포함) | O (Admin) |

---

## 4. 핵심 도메인 모델

### Member

| 필드 | 타입 | 제약 | 필수 |
|---|---|---|---|
| `email` | string | `@sangmyung.kr` 패턴 | O |
| `password` | string | 8~100자 | O |
| `legalName` | string | 최대 50자 | O |
| `gender` | enum | `MALE` / `FEMALE` | O |
| `mbti` | enum | 16종 | O |
| `bankName` | string | - | O |
| `accountNumber` | string | - | O |
| `instagramId` | string | 최대 255자 | X |
| `selfIntroduction` | string | 최대 1000자 | X |
| `idealDescription` | string | 최대 1000자 | X |

역할 전환: `ROLE_MEMBER` → (후보 등록 관리자 승인) → `ROLE_CANDIDATE`

### MatchingRequest

| 필드 | 값 |
|---|---|
| `type` | `RANDOM` / `IDEAL` |
| `status` | `PENDING` / `APPROVED` / `REJECTED` / `WITHDRAWN` |
| `count` | 1~5 정수 |

응답에 `matchingTypeLabel` (한글 라벨), `approvedAt`, `rejectedAt`, `rejectedReason` (조건부 포함)

### MatchingResult

승인된 신청에서만 조회 가능. 상대방의 `nickname`, `gender`, `mbti`, `instagramId`, `selfIntroduction`, `idealDescription` 포함.

### Payment

| 상태 | 설명 |
|---|---|
| `WAITING` | 입금 대기 |
| `CONFIRMED` | 입금 확인 완료 |
| `FAILED` | 거절 또는 실패 |

- 가격: RANDOM 1,000원/인, IDEAL 1,500원/인
- `CONFIRMED` 이후 거절 불가

### FeedItem

| 필드 | 설명 |
|---|---|
| `eventType` | `CANDIDATE_REGISTERED` / `MATCH_REQUESTED` |
| `requestCount` | `CANDIDATE_REGISTERED`일 때 NULL → 옵셔널 처리 필수 |

---

## 5. 상태 흐름

### 결제 / 후보 등록

```
신청
 └─ CandidateRegistration(PENDING) + Payment(WAITING)
      ├─ [관리자 confirm] → Payment(CONFIRMED) + CandidateRegistration(APPROVED) + role → ROLE_CANDIDATE
      ├─ [관리자 reject]  → Payment(FAILED)   + CandidateRegistration(REJECTED)
      └─ [본인 철회]      → APPROVED 상태에서만 가능, 환불 없음
```

### 결제 / 매칭 신청

```
신청
 └─ MatchingRequest(PENDING) + Payment(WAITING)
      ├─ [관리자 confirm] → Payment(CONFIRMED) + MatchingRequest(APPROVED) + 매칭 실행 → MatchingResult 생성
      ├─ [관리자 reject]  → Payment(FAILED)   + MatchingRequest(REJECTED)
      └─ [본인 철회]      → PENDING 상태에서만 가능 (APPROVED/REJECTED 불가)
```

---

## 6. 프론트엔드 구현 시 필요한 특이사항

### 토큰 관리
- Access Token + Refresh Token 이중 관리 필요
- 회원가입 시 이메일 인증 토큰(10분) 별도 임시 저장 필요
- Refresh Token 무효 시 로그인 페이지 강제 이동

### 회원가입 3단계 플로우
1. 이메일 입력 + 인증 코드 발송 (5분 타이머 표시)
2. 6자리 코드 입력 + 검증 → `emailVerificationToken` 임시 저장
3. 프로필/계좌 정보 입력 + 가입 완료 (10분 이내)

### 매칭 신청 내역 탭
`status` 쿼리 파라미터로 `PENDING` / `APPROVED` / `REJECTED` / `WITHDRAWN` 각각 조회.
`APPROVED` 탭에서만 매칭 결과 조회 버튼 제공.

### 관리자 UI
- 결제 거절 시 사유 입력 폼 필수 (공백 불가)
- `CONFIRMED` 상태 결제의 거절 버튼 비활성화 처리

### 입력값 검증 (서버와 동일하게 클라이언트 적용)

| 필드 | 규칙 |
|---|---|
| 이메일 | `^[a-zA-Z0-9._%+\-]+@sangmyung\.kr$` |
| 비밀번호 | 8~100자 |
| 인증 코드 | `\d{6}` (6자리 숫자) |
| 매칭 인원 | 1~5 정수 |
| 거절 사유 | 최소 1자 (공백 불가) |

### 결제 안내 문구 필수 표시
- 정확한 금액을 한 번에 입금 (분할 송금 불가)
- 신청자 이름 = 입금자명 일치 필요
- 관리자 승인까지 최대 약 10분 소요
- 잘못된 계좌 송금 책임은 본인에게 있음
- 환불 불가
