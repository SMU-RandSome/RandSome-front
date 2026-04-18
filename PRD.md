# RandSome 서비스 PRD (Product Requirements Document)

> 버전: 2.0.0
> 기준 API: RandSome API Docs v1.0.0 (OpenAPI 3.1.0)
> 최초 작성: 2026-03-17 / 피벗 개정: 2026-04-18
> 변경 요약: 유료 결제 모델 → 티켓 이코노미 기반 무료 모델 전환

---

## 목차

1. [서비스 개요](#1-서비스-개요)
2. [사용자 유형 및 권한](#2-사용자-유형-및-권한)
3. [핵심 도메인 모델 및 타입 변경](#3-핵심-도메인-모델-및-타입-변경)
4. [도메인별 API 목록](#4-도메인별-api-목록)
5. [상태 흐름](#5-상태-흐름)
6. [신규 기능 요구사항](#6-신규-기능-요구사항)
7. [기존 기능 변경 사항](#7-기존-기능-변경-사항)
8. [제거된 기능](#8-제거된-기능)
9. [프론트엔드 구현 특이사항](#9-프론트엔드-구현-특이사항)

---

## 1. 서비스 개요

**RandSome**은 상명대학교 축제 기간 이성 랜덤 매칭 서비스이다.

- 이용 대상: 상명대학교 재학생 및 휴학생 (`@sangmyung.kr` 이메일 보유자, 19학번 이상)
- **v2.0 피벗**: 기존 계좌이체 결제 기반에서 **티켓 이코노미 기반 무료 모델**로 전환
  - 후보 등록: 완전 무료
  - 매칭 신청: 티켓(랜덤권/이상형권) 소모 방식
  - 티켓 획득: 회원가입, 출석, 쿠폰 이벤트, QR 인증

**서버 기본 URL**: `http://localhost:8080` (개발 환경)

---

## 2. 사용자 유형 및 권한

| 역할 (role) | 설명 | 주요 가능 행위 |
|---|---|---|
| `ROLE_MEMBER` | 일반 회원 | 후보 등록 신청, 매칭 신청, 프로필 조회/수정, 티켓 조회, 쿠폰 사용, 출석 체크, QR 발급, 신고 |
| `ROLE_CANDIDATE` | 매칭 후보자 (관리자 승인 후 전환) | MEMBER와 동일. 추가로 후보 목록에 노출됨 |
| `ROLE_ADMIN` | 관리자 | 회원 목록/상세/정지, 후보 등록 승인/거절, 매칭 내역 조회, 쿠폰 이벤트 CRUD, QR 티켓 발급, 신고 처리 |
| 비회원 (Guest) | 미로그인 사용자 | 피드 조회, 공지사항 조회, 이메일 인증, 회원가입, 로그인만 가능 |

**인증 방식**: JWT Bearer 토큰, Refresh Token 기반 재발급

---

## 3. 핵심 도메인 모델 및 타입 변경

### 3-1. Member (회원) — 변경됨

| 필드 | 타입 | 필수 | v2 변경사항 |
|---|---|---|---|
| `id` | number | - | - |
| `nickname` | string | - | - |
| `legalName` | string | O | - |
| `email` | string | O | - |
| `gender` | `MALE\|FEMALE` | O | - |
| `mbti` | Mbti | O | - |
| `department` | Department | O | - |
| `role` | UserRole | - | - |
| `instagramId` | string | X | - |
| `selfIntroduction` | string | X | - |
| `idealDescription` | string | X | - |
| `personalityTag` | PersonalityTag | O | **신규** (응답에 포함) |
| `faceTypeTag` | FaceTypeTag | O | **신규** (응답에 포함) |
| `datingStyleTag` | DatingStyleTag | O | **신규** (응답에 포함) |
| `candidateRegistrationStatus` | CandidateRegistrationStatus | - | - |
| `exposureCount` | number | - | - |
| ~~`bankName`~~ | string | - | **제거** |
| ~~`accountNumber`~~ | string | - | **제거** |

**회원가입 요청 변경**: `bankName`, `accountNumber` 필드 제거

### 3-2. MatchingHistoryItem — 변경됨

| 필드 | v1 | v2 |
|---|---|---|
| `applicationStatus` | `PENDING\|APPROVED\|REJECTED\|WITHDRAWN` | **`PENDING\|SUCCESS\|CANCELLED`** |
| `matchingTypeLabel` | string | 제거 |
| `approvedAt` | string? | 제거 |
| `rejectedAt` | string? | 제거 |
| `rejectedReason` | string? | 제거 |

### 3-3. MatchingResultDetailItem — 변경됨

| 필드 | v1 | v2 |
|---|---|---|
| `personalityTag` | 없음 | **신규** |
| `faceTypeTag` | 없음 | **신규** |
| `datingStyleTag` | 없음 | **신규** |

### 3-4. CandidateRegistrationStatus — 변경됨

`'NOT_APPLIED' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN'`
→ 관리자 목록에서 `'CANCELED'` 상태 추가 (취소/철회 구분)

---

## 4. 도메인별 API 목록

### 4-1. 인증 (Auth)

| 메서드 | 엔드포인트 | 설명 | JWT |
|---|---|---|---|
| `POST` | `/v1/auth/email/verification-codes` | 이메일 인증 코드 발송 | X |
| `POST` | `/v1/auth/email/verification-codes/verify` | 인증 코드 검증 → 인증 토큰 반환 | X |
| `POST` | `/v1/auth/login` | 로그인 | X |
| `POST` | `/v1/auth/reissue` | 토큰 재발급 | X |
| `POST` | `/v1/auth/logout` | 로그아웃 | O |

### 4-2. 회원 (Member)

| 메서드 | 엔드포인트 | 설명 | JWT |
|---|---|---|---|
| `POST` | `/v1/members/sign-up` | 회원가입 | X |
| `GET` | `/v1/members` | 내 프로필 조회 | O |
| `PATCH` | `/v1/members` | 내 프로필 수정 | O |
| `PATCH` | `/v1/members/password` | 비밀번호 수정 | X |
| `POST` | `/v1/members/withdraw-candidate` | 후보자 등록 철회 | O |
| `PATCH` | `/v1/members/devices` | 디바이스 토큰 동기화 | O |
| `DELETE` | `/v1/members/devices` | 디바이스 토큰 삭제 | O |

### 4-3. 후보 등록 (Candidate Registration)

| 메서드 | 엔드포인트 | 설명 | JWT |
|---|---|---|---|
| `POST` | `/v1/candidate-registrations` | 후보 등록 신청 (무료) | O |
| `POST` | `/v1/candidate-registrations/cancel` | 후보 등록 신청 취소 | O |

### 4-4. 매칭 (Matching)

| 메서드 | 엔드포인트 | 설명 | JWT |
|---|---|---|---|
| `POST` | `/v1/matchings` | 매칭 신청 (티켓 소모, 자동 처리) | O |
| `POST` | `/v1/matchings/applications/{applicationId}/cancel` | 매칭 신청 취소 | O |
| `GET` | `/v1/matchings` | 내 매칭 신청 내역 목록 | O |
| `GET` | `/v1/matchings/applications/{applicationId}` | 특정 매칭 신청 상세 (결과 포함) | O |

### 4-5. 티켓 (Ticket) — 신규

| 메서드 | 엔드포인트 | 설명 | JWT |
|---|---|---|---|
| `GET` | `/v1/tickets/balance` | 보유 티켓 잔고 조회 | O |
| `GET` | `/v1/tickets/history` | 티켓 변동 이력 (커서 페이징) | O |

### 4-6. 쿠폰 (Coupon) — 신규

| 메서드 | 엔드포인트 | 설명 | JWT |
|---|---|---|---|
| `GET` | `/v1/coupons` | 내 쿠폰 목록 (커서 페이징) | O |
| `POST` | `/v1/coupons/{couponId}/use` | 쿠폰 사용 (티켓 충전) | O |
| `POST` | `/v1/coupon-events/{couponEventId}/issue` | 쿠폰 발급 (이벤트 참여) | O |

### 4-7. 출석 (Attendance) — 신규

| 메서드 | 엔드포인트 | 설명 | JWT |
|---|---|---|---|
| `GET` | `/v1/attendance` | 내 출석 현황 조회 | O |
| `POST` | `/v1/attendance` | 출석 체크 | O |

### 4-8. QR 코드 (QR) — 신규

| 메서드 | 엔드포인트 | 설명 | JWT |
|---|---|---|---|
| `GET` | `/v1/qr` | 내 QR 코드 발급 | O |

### 4-9. 신고 (Report) — 신규

| 메서드 | 엔드포인트 | 설명 | JWT |
|---|---|---|---|
| `POST` | `/v1/reports` | 매칭 결과 대상 신고 | O |

### 4-10. 피드 / 통계 / 공지사항

| 메서드 | 엔드포인트 | 설명 | JWT |
|---|---|---|---|
| `GET` | `/v1/feed` | 최신 피드 조회 | X |
| `GET` | `/v1/statistics/dashboard` | 대시보드 통계 | - |
| `GET` | `/v1/announcements` | 공지사항 목록 | X |

### 4-11. 관리자 (Admin)

| 메서드 | 엔드포인트 | 설명 | JWT |
|---|---|---|---|
| `GET` | `/v1/admin/members` | 회원 목록 조회 (페이지) | O |
| `GET` | `/v1/admin/members/{memberId}` | 회원 상세 조회 | O |
| `POST` | `/v1/admin/members/{memberId}/suspensions` | 회원 정지 | O |
| `GET` | `/v1/admin/candidate-registrations` | 후보 등록 신청 목록 (커서) | O |
| `POST` | `/v1/admin/candidate-registrations/{id}/approve` | 후보 등록 승인 | O |
| `POST` | `/v1/admin/candidate-registrations/{id}/reject` | 후보 등록 거절 | O |
| `GET` | `/v1/admin/matching-applications` | 매칭 신청 목록 (페이지) | O |
| `GET` | `/v1/admin/coupon-events` | 쿠폰 이벤트 목록 | O |
| `POST` | `/v1/admin/coupon-events` | 쿠폰 이벤트 생성 | O |
| `GET` | `/v1/admin/coupon-events/{id}` | 쿠폰 이벤트 상세 | O |
| `PATCH` | `/v1/admin/coupon-events/{id}` | 쿠폰 이벤트 수정 | O |
| `DELETE` | `/v1/admin/coupon-events/{id}` | 쿠폰 이벤트 삭제 | O |
| `POST` | `/v1/admin/coupon-events/{id}/activate` | 쿠폰 이벤트 활성화 | O |
| `POST` | `/v1/admin/coupon-events/{id}/deactivate` | 쿠폰 이벤트 비활성화 | O |
| `POST` | `/v1/admin/qr/verify` | QR 인증 및 티켓 발급 | O |
| `GET` | `/v1/admin/reports` | 신고 목록 | O |
| `GET` | `/v1/admin/reports/{reportId}` | 신고 상세 | O |
| `POST` | `/v1/admin/reports/{reportId}/resolve` | 신고 처리 (경고) | O |
| `POST` | `/v1/admin/reports/{reportId}/reject` | 신고 거절 | O |
| `POST` | `/v1/admin/reports/members/{memberId}/restore` | 정지 회원 복구 | O |
| `GET` | `/v1/admin/statistics/candidates/gender-count` | 후보 성별 통계 | O |
| `POST` | `/v1/admin/announcements` | 공지사항 등록 | O |

---

## 5. 상태 흐름

### 후보 등록 (v2 — 무료)

```
신청 → CandidateRegistration(PENDING)
  ├─ [관리자 approve] → APPROVED + role → ROLE_CANDIDATE
  ├─ [관리자 reject]  → REJECTED
  ├─ [본인 취소]      → PENDING 상태에서만 가능 → CANCELED
  └─ [후보자 철회]    → APPROVED 상태에서만 가능 → WITHDRAWN → role → ROLE_MEMBER
```

### 매칭 신청 (v2 — 티켓 소모, 즉시 처리)

```
신청 (티켓 차감) → 즉시 매칭 실행
  ├─ 완전 매칭: SUCCESS + MatchingResult 생성
  ├─ 부분 매칭: SUCCESS + 부족분 티켓 환불 (isPartialMatch: true)
  ├─ 매칭 불가: SUCCESS + 전량 티켓 환불
  └─ [본인 취소]: PENDING → CANCELLED
```

MatchingApplicationResponse:
- `matchingApplicationId`: 신청 ID
- `requestedCount`: 요청 인원
- `matchedCount`: 실제 매칭된 인원
- `refundedTickets`: 환불된 티켓 수 (부분 매칭 시)
- `isPartialMatch`: 부분 매칭 여부

### 티켓 흐름

```
티켓 획득 (EARN)
  ├─ JOIN: 회원가입 시 웰컴팩 지급
  ├─ ATTENDANCE: 연속 출석 보상
  └─ COUPON: 쿠폰 사용 (HAPPY_HOUR / SECRET_CODE 이벤트)

티켓 소모 (USE)
  └─ MATCHING: 매칭 신청 시

티켓 환불 (REFUND)
  ├─ PARTIAL_MATCH_REFUND: 부분 매칭 시 차액 환불
  └─ NO_MATCH_REFUND: 매칭 실패 시 전액 환불
```

### 쿠폰 이벤트 상태

```
DRAFT → [activate] → ACTIVE → [deactivate / 기간 만료] → ENDED
```

쿠폰 이벤트 타입:
- `HAPPY_HOUR`: 특정 시간대 선착순 발급
- `SECRET_CODE`: QR/시크릿 코드로 발급 (소웨 부스 연동)

쿠폰 상태: `AVAILABLE | USED | EXPIRED`

### 신고 처리 흐름

```
신고 생성 (PENDING)
  └─ [관리자]
       ├─ resolve (경고 처리) → RESOLVED + 대상 회원 경고 누적
       └─ reject (신고 거절) → REJECTED

경고 3회 누적 → 회원 자동 정지
[관리자 restore] → 정지 해제
```

---

## 6. 신규 기능 요구사항

### 6-1. 티켓 잔고 페이지

- **위치**: 프로필 또는 홈 상단 고정 영역
- **표시**: 랜덤 매칭권 N장 / 이상형 매칭권 M장
- **연결**: 티켓 이력 조회 페이지로 이동

### 6-2. 티켓 이력 페이지

- 커서 기반 무한 스크롤
- 각 항목: 날짜, 유형(RANDOM/IDEAL), 액션(획득/사용/환불), 출처, 수량, 설명

| `actionType` | 표시 | `source` | 표시 |
|---|---|---|---|
| `EARN` | +N장 획득 | `JOIN` | 가입 보상 |
| `USE` | -N장 사용 | `ATTENDANCE` | 출석 보상 |
| `REFUND` | +N장 환불 | `COUPON` | 쿠폰 |
| | | `MATCHING` | 매칭 신청 |
| | | `PARTIAL_MATCH_REFUND` | 부분 매칭 환불 |
| | | `NO_MATCH_REFUND` | 매칭 불가 환불 |
| | | `ADMIN` | 관리자 지급 |

### 6-3. 출석 체크 화면

- 표시: 전체 출석일 수 / 출석 완료일 수 / 출석 날짜 목록 (달력 또는 리스트)
- 출석 체크 버튼: 당일 미출석 시에만 활성화
- 출석 체크 성공 시 티켓 획득 토스트 표시

### 6-4. 쿠폰 목록 / 사용 화면

- 보유 쿠폰 목록 (커서 페이징)
- 각 쿠폰: 이벤트명, 상태(사용가능/사용완료/만료), 만료일, 보상 티켓 수량
- `AVAILABLE` 쿠폰에만 사용 버튼 활성화
- 쿠폰 사용 시 확인 모달 → 사용 완료 후 티켓 잔고 갱신

### 6-5. 쿠폰 이벤트 발급 화면

- `GET /v1/coupon-events/{id}` → 이벤트 정보 표시 후 발급 버튼
- `HAPPY_HOUR` 이벤트: URL을 통해 직접 진입
- `SECRET_CODE` 이벤트: 시크릿 코드 입력 → 발급 (소웨 부스 QR 연동)

### 6-6. QR 코드 발급 화면

- 회원이 자신의 QR 코드를 발급받아 표시
- 부스 관리자가 스캔 → 티켓 발급 (`POST /v1/admin/qr/verify` + ticketType 지정)

### 6-7. 신고 기능

- 매칭 결과 페이지의 각 결과 항목에 신고 버튼 추가
- 신고 모달: 사유 선택 (INAPPROPRIATE_CONTENT / PLAGIARIZED_PROFILE / FAKE_PROFILE / HARASSMENT / SCAM / OTHER) + 상세 설명
- 신고 완료 후 성공 토스트

| 신고 사유 | 한글 |
|---|---|
| `INAPPROPRIATE_CONTENT` | 부적절한 콘텐츠 |
| `PLAGIARIZED_PROFILE` | 도용된 프로필 |
| `FAKE_PROFILE` | 허위 프로필 |
| `HARASSMENT` | 괴롭힘 |
| `SCAM` | 사기 |
| `OTHER` | 기타 |

---

## 7. 기존 기능 변경 사항

### 7-1. 회원가입 — 수정

- 제거: 계좌 정보 입력 단계 (`bankName`, `accountNumber`)
- 수정: 회원가입 완료 시 웰컴팩 티켓 자동 지급 안내

### 7-2. 프로필 — 수정

- 제거: 계좌 정보 표시/수정 UI
- 추가: 보유 티켓 잔고 표시 (랜덤/이상형 구분)

### 7-3. 매칭 신청 — 대폭 변경

**신청 전 변경**
- 결제/송금 안내 → 티켓 잔고 확인 + 필요 티켓 수 안내
- 이상형 기반 매칭 시: 선호 태그 선택 화면 추가
  - `preferredPersonalityTag`: ACTIVE / QUIET / AFFECTIONATE / INDEPENDENT / FUNNY / SERIOUS / OPTIMISTIC / CAREFUL
  - `preferredFaceTypeTag`: PUPPY / CAT / BEAR / FOX / RABBIT / PURE / CHIC / WARM
  - `preferredDatingStyleTag`: FREQUENT_CONTACT / MODERATE_CONTACT / PLANNED_DATE / SPONTANEOUS_DATE / SKINSHIP_LOVER / RESPECTFUL_SPACE / EXPRESSIVE / GROW_TOGETHER

**신청 결과 변경**
- 즉시 처리: 신청 완료 시 바로 결과 응답
- 부분 매칭 안내: `isPartialMatch: true` 시 환불 티켓 수 표시

**매칭 내역 탭 변경**
- 기존: PENDING(대기) / APPROVED(승인) / REJECTED(거절)
- 변경: PENDING(처리 중) / SUCCESS(매칭 완료) / CANCELLED(취소)

**매칭 결과 화면 변경**
- 상대방 프로필에 `personalityTag`, `faceTypeTag`, `datingStyleTag` 표시

### 7-4. 후보 등록 — 수정

- 결제/송금 안내 제거
- 즉시 신청 가능 (결제 대기 없음)
- 관리자 심사(PENDING → APPROVED/REJECTED)는 유지

### 7-5. 관리자 대시보드 — 수정

- 결제 관리 탭 완전 제거
- 신규 탭 추가:
  - **쿠폰 이벤트 관리**: 생성/수정/삭제/활성화/비활성화
  - **신고 관리**: 목록 조회, 상세, 처리(경고)/거절, 회원 복구

---

## 8. 제거된 기능

| 기능 | 이유 |
|---|---|
| 계좌이체 결제 | 티켓 모델로 대체 |
| 결제 확인/거절 (관리자) | 불필요 |
| 송금 안내 화면 | 불필요 |
| 관리자 매칭 신청 승인/거절 | 자동 처리로 대체 |
| 회원 계좌 정보 (bankName, accountNumber) | 결제 제거로 불필요 |

---

## 9. 프론트엔드 구현 특이사항

### 토큰 관리 (동일)

- Access Token + Refresh Token 이중 관리
- 회원가입 시 이메일 인증 토큰(10분) 임시 저장
- Refresh Token 무효 시 로그인 페이지 강제 이동

### 회원가입 플로우 (수정)

1. 이메일 입력 + 인증 코드 발송 (5분 타이머)
2. 6자리 코드 입력 + 검증 → `emailVerificationToken` 저장
3. 프로필 정보 입력 (태그 필수) ← **계좌 정보 단계 제거**

### 매칭 신청 플로우 (수정)

1. 매칭 유형 선택 (RANDOM / IDEAL)
2. IDEAL 선택 시: 선호 태그 3종 선택
3. 인원 선택 (1~5명) + 필요 티켓 수 안내
4. 신청 → 즉시 결과 표시 (부분 매칭 안내 포함)

### 입력값 검증

| 필드 | 규칙 |
|---|---|
| 이메일 | `^[a-zA-Z0-9._%+\-]+@sangmyung\.kr$` |
| 비밀번호 | 8~100자 |
| 인증 코드 | `\d{6}` (6자리 숫자) |
| 매칭 인원 | 1~5 정수 |
| 신고 설명 | 최소 1자 (공백 불가) |
| 쿠폰 이벤트 사유 | 최소 1자 |

### 티켓 부족 처리

- 매칭 신청 전 잔고 확인 필수
- 잔고 부족 시: 쿠폰/출석으로 충전 안내 화면으로 유도

### 태그 한글 매핑

```ts
// PersonalityTag
ACTIVE: '활발함', QUIET: '조용함', AFFECTIONATE: '다정함',
INDEPENDENT: '독립적', FUNNY: '유머러스', SERIOUS: '진지함',
OPTIMISTIC: '낙관적', CAREFUL: '신중함'

// FaceTypeTag
PUPPY: '강아지상', CAT: '고양이상', BEAR: '곰상',
FOX: '여우상', RABBIT: '토끼상', PURE: '청순', CHIC: '시크', WARM: '따뜻한'

// DatingStyleTag
FREQUENT_CONTACT: '자주 연락', MODERATE_CONTACT: '적당히 연락',
PLANNED_DATE: '계획적 데이트', SPONTANEOUS_DATE: '즉흥 데이트',
SKINSHIP_LOVER: '스킨십 好', RESPECTFUL_SPACE: '공간 존중',
EXPRESSIVE: '감정 표현', GROW_TOGETHER: '함께 성장'
```
