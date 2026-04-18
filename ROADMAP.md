# 기능 개발 순서 (v2.0 — 티켓 이코노미 피벗)

도메인 의존성 기준으로 정렬한다. 앞 단계가 완료되어야 다음 단계를 진행할 수 있다.

---

## Phase 0. 프로젝트 기반 구축

모든 기능의 전제 조건.

- [x] 라우팅 설정 (React Router — public / protected / admin 분리)
- [x] API 클라이언트 설정 (baseURL, 인터셉터, 토큰 자동 첨부, 401 갱신 처리)
- [x] 공통 컴포넌트 (Button, Input, Modal, Toast 등)
- [x] 레이아웃 (Header, Footer, 페이지 래퍼)
- [x] 전역 상태 관리 설정 (인증 상태 등)

---

## Phase 1. 인증

회원 기능 전체의 전제 조건.

- [x] 회원가입 (성별·MBTI·소개글·비밀번호 입력 + `@sangmyung.kr` 이메일 인증)
- [ ] **회원가입 수정**: 계좌 정보 입력 단계 제거
- [x] 로그인 / 로그아웃
- [x] Access Token / Refresh Token 관리 (자동 갱신) — axios 인터셉터 구조 구현
- [x] Protected Route 가드 (미인증 시 로그인 페이지로 리다이렉트)

---

## Phase 2. 메인 페이지

비회원도 접근 가능. 인증과 독립적이므로 Phase 1과 병행 가능.

- [x] 최근 매칭 소식 피드

---

## Phase 3. 타입 및 API 레이어 수정 — ⚡ 우선 진행

기존 구현이 있는 기능들의 백엔드 스펙 변경 대응.

- [ ] `src/types/index.ts` 업데이트
  - `MemberProfile`: `bankName`/`accountNumber` 제거, 태그 필드 추가
  - `MemberCreateRequest`: `bankName`/`accountNumber` 제거
  - `MemberProfileUpdateRequest`: `bankName`/`accountNumber` 제거
  - `MatchingHistoryItem.applicationStatus`: `PENDING|APPROVED|REJECTED|WITHDRAWN` → `PENDING|SUCCESS|CANCELLED`
  - `MatchingApplicationRequest` → 선호 태그 필드 추가
  - `MatchingApplicationResponse` 신규 (즉시 처리 결과)
  - `MatchingResultDetailItem`: 태그 필드 추가
  - Payment 관련 타입 전체 제거
  - 신규 타입 추가: `TicketBalanceResponse`, `TicketHistoryItem`, `CouponItem`, `CouponEventPreviewItem`, `CouponEventDetailItem`, `AttendanceResponse`, `ReportCreateRequest`, 관리자 신고/쿠폰 관련

- [ ] 기존 features API 파일 수정
  - `features/matching/api.ts`: 매칭 신청 엔드포인트/응답 형식 변경
  - `features/candidate/api.ts`: 결제 관련 제거
  - `features/member/api.ts`: 계좌 관련 제거

---

## Phase 4. 회원 기능 수정

Phase 3 완료 후 진행.

### 4-1. 프로필 수정

- [ ] 계좌 정보(bankName, accountNumber) 표시/수정 UI 제거
- [ ] 태그 정보(personalityTag, faceTypeTag, datingStyleTag) 표시 추가
- [ ] 티켓 잔고 위젯 추가 (랜덤권 N장 / 이상형권 M장)

### 4-2. 매칭 후보 등록 수정

- [ ] 결제/송금 안내 화면 제거
- [ ] 즉시 신청 확인 모달로 교체

### 4-3. 매칭 신청 수정

- [ ] 결제/송금 안내 화면 제거
- [ ] 이상형 매칭 선택 시: 선호 태그 3종 선택 단계 추가
- [ ] 신청 전 티켓 잔고 확인 + 필요 티켓 수 표시
- [ ] 신청 완료 후 즉시 결과 화면 (부분 매칭 안내 포함)
- [ ] 매칭 내역 탭 변경: SUCCESS/CANCELLED로 수정
- [ ] 매칭 결과 화면: 태그 정보(personalityTag, faceTypeTag, datingStyleTag) 표시

---

## Phase 5. 신규 기능 — 티켓 & 출석 & 쿠폰

Phase 3 완료 후 진행.

### 5-1. 티켓

- [ ] `features/ticket/api.ts` 생성
- [ ] 티켓 잔고 조회 훅 (`useTicketBalance`)
- [ ] 티켓 이력 페이지 (`/tickets/history`)
  - 커서 기반 무한 스크롤
  - actionType/source 한글 표시

### 5-2. 출석 체크

- [ ] `features/attendance/api.ts` 생성
- [ ] 출석 페이지 (`/attendance`)
  - 출석 현황 표시 (totalDays / attendedDays / attendanceDates)
  - 출석 체크 버튼 (당일 미출석 시만 활성화)
  - 출석 성공 시 티켓 획득 토스트

### 5-3. 쿠폰

- [ ] `features/coupon/api.ts` 생성
- [ ] 쿠폰 목록 페이지 (`/coupons`)
  - 커서 기반 무한 스크롤
  - AVAILABLE 쿠폰만 사용 버튼 활성화
- [ ] 쿠폰 사용 확인 모달

### 5-4. 쿠폰 이벤트 발급

- [ ] 쿠폰 이벤트 참여 페이지 (`/coupon-events/:id`)
  - 이벤트 정보 표시
  - 발급 버튼

---

## Phase 6. 신규 기능 — QR & 신고

Phase 5와 병행 가능.

### 6-1. QR 코드 발급

- [ ] `features/qr/api.ts` 생성
- [ ] QR 코드 페이지 (`/qr`)
  - QR 이미지 표시
  - 안내 문구 (부스에서 스캔하면 티켓 지급)

### 6-2. 신고

- [ ] `features/report/api.ts` 생성
- [ ] 매칭 결과 페이지에 신고 버튼 추가
- [ ] 신고 모달
  - 사유 선택 (6종)
  - 상세 설명 입력
  - 제출 후 성공 토스트

---

## Phase 7. 관리자 기능 수정

Phase 4~6 완료 후 진행.

### 7-1. 기존 수정

- [ ] 결제 관리 탭 완전 제거
- [ ] 매칭 신청 목록: 상태 표시 변경 (SUCCESS/CANCELLED)
- [ ] 회원 상세: 계좌 정보 제거

### 7-2. 신규 — 쿠폰 이벤트 관리

- [ ] 쿠폰 이벤트 목록 (`/admin/coupon-events`)
  - 상태 뱃지 (DRAFT/ACTIVE/ENDED)
  - 활성화/비활성화 토글
- [ ] 쿠폰 이벤트 생성 폼
  - type: HAPPY_HOUR / SECRET_CODE
  - rewardTicketType: RANDOM / IDEAL
  - 기간 설정 (startsAt / expiresAt / couponExpiresAt)
- [ ] 쿠폰 이벤트 수정 / 삭제

### 7-3. 신규 — 신고 관리

- [ ] 신고 목록 (`/admin/reports`)
  - 상태 필터 (PENDING / IN_REVIEW / RESOLVED / REJECTED)
- [ ] 신고 상세 (`/admin/reports/:id`)
  - 신고자/피신고자 정보
  - 활성 신고 건수 표시
  - 처리(경고) / 거절 버튼
- [ ] 회원 복구 (`/admin/reports/members/:memberId/restore`)

### 7-4. 신규 — QR 인증

- [ ] 관리자 QR 스캔 페이지 (`/admin/qr`)
  - 카메라로 QR 스캔 or qrToken 직접 입력
  - ticketType 선택 (RANDOM / IDEAL)
  - 발급 확인
