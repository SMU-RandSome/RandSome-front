// --- 공통 ---

export type Gender = 'MALE' | 'FEMALE';

export type UserRole = 'ROLE_MEMBER' | 'ROLE_SUSPEND_MEMBER' | 'ROLE_CANDIDATE' | 'ROLE_ADMIN';

// --- 태그 (v2) ---

export type PersonalityTag = 'ACTIVE' | 'QUIET' | 'AFFECTIONATE' | 'INDEPENDENT' | 'FUNNY' | 'SERIOUS' | 'OPTIMISTIC' | 'CAREFUL';

export type FaceTypeTag = 'PUPPY' | 'CAT' | 'BEAR' | 'FOX' | 'RABBIT' | 'PURE' | 'CHIC' | 'WARM';

export type DatingStyleTag = 'FREQUENT_CONTACT' | 'MODERATE_CONTACT' | 'PLANNED_DATE' | 'SPONTANEOUS_DATE' | 'SKINSHIP_LOVER' | 'RESPECTFUL_SPACE' | 'EXPRESSIVE' | 'GROW_TOGETHER';

export type Mbti =
  | 'ISTJ' | 'ISFJ' | 'INFJ' | 'INTJ'
  | 'ISTP' | 'ISFP' | 'INFP' | 'INTP'
  | 'ESTP' | 'ESFP' | 'ENFP' | 'ENTP'
  | 'ESTJ' | 'ESFJ' | 'ENFJ' | 'ENTJ';

export type Department =
  | 'KOREAN_LANGUAGE_CULTURE'
  | 'JAPANESE_REGIONAL_STUDIES'
  | 'CHINESE_REGIONAL_STUDIES'
  | 'ENGLISH_REGIONAL_STUDIES'
  | 'FRENCH_REGIONAL_STUDIES'
  | 'GERMAN_REGIONAL_STUDIES'
  | 'RUSSIAN_CENTRAL_ASIA_REGIONAL_STUDIES'
  | 'COMMUNICATION_DESIGN'
  | 'FASHION_DESIGN'
  | 'TEXTILE_DESIGN'
  | 'SPACE_DESIGN'
  | 'CERAMIC_DESIGN'
  | 'INDUSTRIAL_DESIGN'
  | 'AR_VR_MEDIA_DESIGN'
  | 'FILM_VIDEO'
  | 'THEATER'
  | 'STAGE_ART'
  | 'PHOTO_VIDEO_MEDIA'
  | 'DIGITAL_COMICS_VIDEO'
  | 'ARTS_CULTURE_MANAGEMENT'
  | 'AI_MEDIA_CONTENT'
  | 'GLOBAL_FINANCE_MANAGEMENT'
  | 'FOOD_ENGINEERING'
  | 'GREEN_SMART_CITY'
  | 'NURSING'
  | 'BIO_FOOD_TECH'
  | 'SPORTS_CONVERGENCE'
  | 'ELECTRONICS_ENGINEERING'
  | 'SOFTWARE'
  | 'SMART_INFO_COMMUNICATION_ENGINEERING'
  | 'INDUSTRIAL_MANAGEMENT_ENGINEERING'
  | 'GREEN_CHEMICAL_ENGINEERING'
  | 'CIVIL_SYSTEM_ENGINEERING'
  | 'INFORMATION_SECURITY_ENGINEERING'
  | 'SYSTEM_SEMICONDUCTOR_ENGINEERING'
  | 'HUMAN_INTELLIGENT_ROBOT_ENGINEERING'
  | 'INTELLIGENT_ROBOTICS'
  | 'AI_MOBILITY_ENGINEERING'
  | 'SMART_IT_CONVERGENCE_ENGINEERING'
  | 'SELF_DIRECTED_MAJOR';

export interface ErrorMessage {
  code: string;
  message: string;
  data: unknown;
}

export interface ApiResponse<T> {
  result: 'SUCCESS' | 'ERROR';
  data: T | null;
  error: ErrorMessage | null;
}

// --- 인증 ---

export type VerificationPurpose = 'SIGN_UP' | 'PASSWORD_RESET';

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface EmailVerificationTokenResponse {
  emailVerificationToken: string;
}

export interface EmailVerificationRequest {
  email: string;
}

export interface EmailVerificationCodeVerifyRequest {
  email: string;
  code: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenReissueRequest {
  refreshToken: string;
}

// --- 회원 ---

export type CandidateRegistrationStatus = 'NOT_APPLIED' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN' | 'CANCELED';

export interface MemberProfile {
  id: number;
  nickname: string;
  legalName: string;
  email: string;
  gender: Gender;
  mbti: Mbti;
  department?: Department;
  role: UserRole;
  instagramId?: string;
  selfIntroduction?: string;
  idealDescription?: string;
  personalityTag?: PersonalityTag;
  faceTypeTag?: FaceTypeTag;
  datingStyleTag?: DatingStyleTag;
  candidateRegistrationStatus: CandidateRegistrationStatus;
  exposureCount: number;
}

export interface MemberProfileUpdateRequest {
  legalName: string;
  mbti: Mbti;
  department: Department;
  instagramId?: string;
  selfIntroduction?: string;
  idealDescription?: string;
  personalityTag: PersonalityTag;
  faceTypeTag: FaceTypeTag;
  datingStyleTag: DatingStyleTag;
}

export interface MemberCreateRequest {
  emailVerificationToken: string;
  email: string;
  password: string;
  legalName: string;
  gender: Gender;
  mbti: Mbti;
  department: Department;
  instagramId?: string;
  selfIntroduction?: string;
  idealDescription?: string;
  personalityTag?: PersonalityTag;
  faceTypeTag?: FaceTypeTag;
  datingStyleTag?: DatingStyleTag;
  agreedToTerms: boolean;
}

// authStore에서 사용하는 로그인된 사용자 타입
export type AuthUser = MemberProfile;

// --- 비밀번호 변경 ---

export interface PasswordUpdateRequest {
  email: string;
  emailVerificationToken: string;
  newPassword: string;
}

// --- 디바이스 ---

export interface DeviceTokenSyncRequest {
  deviceToken: string;
}

// --- 공지사항 ---

export interface Announcement {
  id: number;
  title: string;
  content: string;
  createdAt: string;
}

export interface AnnouncementRegisterRequest {
  title: string;
  content: string;
}

// --- 피드 ---

export type FeedEventType = 'CANDIDATE_REGISTERED' | 'MATCH_REQUESTED';

export interface FeedItem {
  id: number;
  eventType: FeedEventType;
  nickname: string;
  requestCount?: number; // CANDIDATE_REGISTERED일 때 null
  createdAt: string;
}

// --- 매칭 ---

export type MatchingType = 'RANDOM' | 'IDEAL';

export type MatchingApplicationStatus = 'PENDING' | 'SUCCESS' | 'PARTIAL_MATCH' | 'FAILED' | 'CANCELLED';

export interface MatchingApplicationRequest {
  matchingType: MatchingType;
  applicationCount: number;
  preferredPersonalityTag?: PersonalityTag;
  preferredFaceTypeTag?: FaceTypeTag;
  preferredDatingStyleTag?: DatingStyleTag;
}

export interface MatchingApplicationResponse {
  matchingApplicationId: number;
  matchingType: MatchingType;
  applicationStatus: MatchingApplicationStatus;
  requestedCount: number;
  matchedCount: number;
  refundedTickets: number;
  isPartialMatch: boolean;
}

export interface MatchingHistoryItem {
  id: number;
  matchingType: MatchingType;
  applicationStatus: MatchingApplicationStatus;
  appliedAt: string;
  applicationCount: number;
  matchedCount: number;
}

export interface MatchingResultDetailItem {
  id: number;
  nickname: string;
  gender: Gender;
  mbti: Mbti;
  instagramId?: string;
  selfIntroduction?: string;
  idealDescription?: string;
  personalityTag: PersonalityTag;
  faceTypeTag: FaceTypeTag;
  datingStyleTag: DatingStyleTag;
}

// --- 티켓 (v2) ---

export type TicketType = 'RANDOM' | 'IDEAL';

export type TicketActionType = 'EARN' | 'USE' | 'REFUND';

export type TicketSource = 'JOIN' | 'ATTENDANCE' | 'COUPON' | 'MATCHING' | 'PARTIAL_MATCH_REFUND' | 'NO_MATCH_REFUND' | 'ADMIN';

export interface TicketBalanceResponse {
  randomTicketCount: number;
  idealTicketCount: number;
}

export interface TicketHistoryItem {
  id: number;
  ticketType: TicketType;
  actionType: TicketActionType;
  source: TicketSource;
  amount: number;
  description: string;
  createdAt: string;
}

// --- 쿠폰 (v2) ---

export type CouponStatus = 'AVAILABLE' | 'USED' | 'EXPIRED';

export type CouponEventType = 'HAPPY_HOUR' | 'SECRET_CODE';

export type CouponEventStatus = 'DRAFT' | 'ACTIVE' | 'SOLD_OUT' | 'ENDED';

export interface CouponItem {
  id: number;
  eventName: string;
  status: CouponStatus;
  ticketType: TicketType;
  eventExpiresAt: string;
  rewardTicketAmount: number;
}

export interface CouponEventPreviewItem {
  id: number;
  name: string;
  eventType: CouponEventType;
  status: CouponEventStatus;
  totalQuantity: number;
}

export interface AdminCouponEventPreviewItem {
  id: number;
  name: string;
  eventType: CouponEventType;
  status: CouponEventStatus;
  totalQuantity: number;
  remainingQuantity: number;
  startsAt: string;
  expiresAt: string;
}

export interface CouponEventDetailItem {
  id: number;
  name: string;
  description?: string;
  eventType: CouponEventType;
  status: CouponEventStatus;
  totalQuantity: number;
  rewardTicketType: TicketType;
  rewardTicketAmount: number;
  startsAt: string;
  expiresAt: string;
}

export interface CouponEventDetailResponse {
  id: number;
  name: string;
  description?: string;
  eventType: CouponEventType;
  status: CouponEventStatus;
  totalQuantity: number;
  rewardTicketType: TicketType;
  rewardTicketAmount: number;
  isIssuable: boolean;
  startsAt: string;
  expiresAt: string;
}

export interface CouponEventRegisterRequest {
  name: string;
  description?: string;
  type: CouponEventType;
  totalQuantity: number;
  rewardTicketType: TicketType;
  rewardTicketAmount?: number;
  startsAt: string;
  expiresAt: string;
  couponExpiresAt: string;
}

export interface CouponEventUpdateRequest {
  name: string;
  description?: string;
  type: CouponEventType;
  totalQuantity: number;
  rewardTicketType: TicketType;
  rewardTicketAmount?: number;
  startsAt: string;
  expiresAt: string;
  couponExpiresAt: string;
}

// --- 회원 통계 (v2) ---

export interface MemberStatsResponse {
  exposureCount: number;
  sentApplicationCount: number;
  attendanceDays: number;
}

// --- 출석 (v2) ---

export interface AttendanceResponse {
  totalDays: number;
  attendedDays: number;
  attendanceDates: string[];
}

// --- 신고 (v2) ---

export type ReportReason = 'INAPPROPRIATE_CONTENT' | 'PLAGIARIZED_PROFILE' | 'FAKE_PROFILE' | 'HARASSMENT' | 'SCAM' | 'OTHER';

export type ReportStatus = 'PENDING' | 'IN_REVIEW' | 'RESOLVED' | 'REJECTED';

export type ReportStatusFilter = 'PENDING' | 'IN_REVIEW' | 'COMPLETED';

export interface ReportCreateRequest {
  matchingResultId: number;
  reason: ReportReason;
  description: string;
}

export interface AdminReportListItem {
  id: number;
  reporterNickname: string;
  reportedMemberNickname: string;
  targetType: 'MATCHING_RESULT';
  reason: ReportReason;
  reportStatus: ReportStatus;
  createdAt: string;
}

export interface AdminReportDetailResponse {
  id: number;
  reporterId: number;
  reporterNickname: string;
  reportedMemberId: number;
  reportedMemberNickname: string;
  targetType: 'MATCHING_RESULT';
  targetId: number;
  reason: ReportReason;
  description: string;
  reportStatus: ReportStatus;
  activeReportCount: number;
  createdAt: string;
}

// --- QR (v2) ---

export interface AdminQrVerifyRequest {
  qrToken: string;
  ticketType: TicketType;
}

// --- 관리자 ---

export interface AdminMatchingItem {
  id: number;
  applicantNickname: string;
  applicantLegalName: string;
  applicantGender: Gender;
  matchingType: MatchingType;
  applicationCount: number;
  applicationStatus: MatchingApplicationStatus;
  matchedCount: number;
  createdAt: string;
}

export interface AdminCandidateRegistrationItem {
  id: number;
  memberId: number;
  memberNickname: string;
  memberLegalName: string;
  registrationStatus: CandidateRegistrationStatus;
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectedReason?: string;
  withdrawnAt?: string;
}

export type CandidateRegistrationFilter = 'PENDING' | 'COMPLETED';

export interface RestrictionRequest {
  reason: string;
}

export interface CandidateGenderCountResponse {
  maleCount: number;
  femaleCount: number;
}

export interface DashboardResponse {
  candidateCount: number;
  todayMatchingCount: number;
  totalMatchingCount: number;
}

export interface AdminMemberListItem {
  id: number;
  nickname: string;
  legalName: string;
  gender: Gender;
  mbti: Mbti;
  role: UserRole;
}

export interface AdminMemberDetail {
  id: number;
  nickname: string;
  legalName: string;
  email: string;
  gender: Gender;
  mbti: Mbti;
  role: UserRole;
  instagramId?: string;
  selfIntroduction?: string;
  idealDescription?: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  hasNext: boolean;
}

export interface CursorSlice<T> {
  items: T[];
  nextCursor: number | null;
  hasNext: boolean;
}
