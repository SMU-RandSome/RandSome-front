import { apiClient } from '@/lib/axios';
import type { ApiResponse, MemberProfile, MemberProfileUpdateRequest, PasswordUpdateRequest, DeviceTokenSyncRequest } from '@/types';

export const getMyProfile = (): Promise<ApiResponse<MemberProfile>> =>
  apiClient.get<ApiResponse<MemberProfile>>('/v1/members').then((r) => r.data);

export const updateMyProfile = (body: MemberProfileUpdateRequest): Promise<ApiResponse<null>> =>
  apiClient.patch<ApiResponse<null>>('/v1/members', body).then((r) => r.data);

export const updatePassword = (body: PasswordUpdateRequest): Promise<ApiResponse<null>> =>
  apiClient.patch<ApiResponse<null>>('/v1/members/password', body).then((r) => r.data);

export const syncDeviceToken = (body: DeviceTokenSyncRequest): Promise<ApiResponse<null>> =>
  apiClient.patch<ApiResponse<null>>('/v1/members/devices', body).then((r) => r.data);

export const deleteDeviceToken = (): Promise<ApiResponse<null>> =>
  apiClient.delete<ApiResponse<null>>('/v1/members/devices').then((r) => r.data);
