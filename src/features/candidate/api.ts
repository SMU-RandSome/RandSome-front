import { apiClient } from '@/lib/axios';
import type { ApiResponse } from '@/types';

export const registerCandidate = (): Promise<ApiResponse<null>> =>
  apiClient.post<ApiResponse<null>>('/v1/candidate-registrations').then((r) => r.data);

// PENDING 상태일 때: 신청 취소
export const cancelCandidateRegistration = (): Promise<ApiResponse<null>> =>
  apiClient.post<ApiResponse<null>>('/v1/candidate-registrations/cancel').then((r) => r.data);

// APPROVED 상태일 때: 후보자 철회 (ROLE_CANDIDATE → ROLE_MEMBER, 티켓 반환)
export const withdrawCandidate = (): Promise<ApiResponse<null>> =>
  apiClient.post<ApiResponse<null>>('/v1/members/withdraw-candidate').then((r) => r.data);
