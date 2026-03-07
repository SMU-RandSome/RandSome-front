// --- 공통 ---

export type Gender = 'male' | 'female';

export type UserRole = 'ROLE_MEMBER' | 'ROLE_CANDIDATE' | 'ROLE_ADMIN';

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

// --- 회원 ---

export interface Profile {
  id: number;
  nickname: string;
  mbti: string;
  intro: string;
  gender: Gender;
  instagramId?: string;
  idealType?: string;
}

export interface AuthUser extends Profile {
  email: string;
  role: UserRole;
}

// --- 매칭 ---

export type RequestType = 'register' | 'match_random' | 'match_ideal';

export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface MatchResult {
  id: number;
  partnerId: number;
  matchedAt: string;
  partnerProfile: Profile;
}

export interface MatchRequest {
  id: number;
  type: RequestType;
  status: RequestStatus;
  amount: number;
  count?: number;
  createdAt: string;
  matches?: MatchResult[];
  rejectionReason?: string;
}

// --- 결제 ---

export type PaymentStatus = 'WAITING' | 'CONFIRMED' | 'FAILED';

export interface Payment {
  id: number;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
}
