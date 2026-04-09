// --- 공통 ---

export type Gender = 'MALE' | 'FEMALE';

export type UserRole = 'ROLE_MEMBER' | 'ROLE_CANDIDATE' | 'ROLE_ADMIN';

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

export type CandidateRegistrationStatus = 'NOT_APPLIED' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN';

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
  personalityTag?: string;
  faceTypeTag?: string;
  datingStyleTag?: string;
  bankName?: string;
  accountNumber?: string;
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
  bankName?: string;
  accountNumber?: string;
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
  personalityTag: string;
  faceTypeTag: string;
  datingStyleTag: string;
  agreedToTerms: boolean;
  bankName: string;
  accountNumber: string;
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

export type MatchingApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN';

export interface MatchingApplicationRequest {
  matchingType: MatchingType;
  applicationCount: number;
}

export interface MatchingHistoryItem {
  id: number;
  matchingTypeLabel: string;
  applicationStatus: MatchingApplicationStatus;
  appliedAt: string;
  applicationCount: number;
  approvedAt?: string;
  rejectedAt?: string;
  rejectedReason?: string;
}

export interface MatchingResultDetailItem {
  id: number;
  nickname: string;
  gender: Gender;
  mbti: Mbti;
  instagramId?: string;
  selfIntroduction?: string;
  idealDescription?: string;
}

// --- 결제 ---

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'REJECTED';

export type PaymentFilterStatus = 'PENDING' | 'PROCESSED';

export type PaymentType = 'CANDIDATE_REGISTRATION' | 'RANDOM_MATCHING' | 'IDEAL_TYPE_MATCHING';

export interface PaymentPreviewItem {
  paymentId: number;
  memberName: string;
  paymentType: PaymentType;
  paymentStatus: PaymentStatus;
  amount: number;
  applicationCount?: number;
  rejectedReason?: string;
  applyAt: string;
}

// --- 관리자 ---

export interface CandidateGenderCountResponse {
  maleCount: number;
  femaleCount: number;
}

export interface PaymentStatusStatisticsResponse {
  pendingCount: number;
  processedCount: number;
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
  bankName?: string;
  accountNumber?: string;
}

export interface PageResponse<T> {
  content: T[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaymentRejectRequest {
  rejectedReason: string;
}
