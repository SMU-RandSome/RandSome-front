import { apiClient } from '@/lib/axios';
import type { ApiResponse } from '@/types';

export const registerCandidate = (): Promise<ApiResponse<null>> =>
  apiClient.post<ApiResponse<null>>('/v1/candidate-registrations').then((r) => r.data);

// PENDING 상태일 때: 신청 취소 (결제 정보도 함께 취소됨)
export const cancelCandidateRegistration = (): Promise<ApiResponse<null>> =>
  apiClient.post<ApiResponse<null>>('/v1/candidate-registrations/cancel').then((r) => r.data);

// APPROVED 상태일 때: 후보자 철회 (ROLE_CANDIDATE → ROLE_MEMBER)
export const withdrawCandidate = (): Promise<ApiResponse<null>> =>
  apiClient.post<ApiResponse<null>>('/v1/members/withdraw-candidate').then((r) => r.data);
