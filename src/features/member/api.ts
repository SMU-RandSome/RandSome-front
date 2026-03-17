import { apiClient } from '@/lib/axios';
import type { ApiResponse, MemberProfile, MemberProfileUpdateRequest } from '@/types';

export const getMyProfile = (): Promise<ApiResponse<MemberProfile>> =>
  apiClient.get<ApiResponse<MemberProfile>>('/v1/members').then((r) => r.data);

export const updateMyProfile = (body: MemberProfileUpdateRequest): Promise<ApiResponse<null>> =>
  apiClient.patch<ApiResponse<null>>('/v1/members', body).then((r) => r.data);
