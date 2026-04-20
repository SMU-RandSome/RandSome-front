import { apiClient } from '@/lib/axios';
import type {
  ApiResponse,
  AdminMemberListItem,
  AdminMemberDetail,
  AdminMatchingApplicationItem,
  PageResponse,
  CandidateGenderCountResponse,
  AnnouncementRegisterRequest,
} from '@/types';

export const getAdminMembers = (params?: { page?: number; size?: number }): Promise<ApiResponse<PageResponse<AdminMemberListItem>>> =>
  apiClient
    .get<ApiResponse<PageResponse<AdminMemberListItem>>>('/v1/admin/members', { params })
    .then((r) => r.data);

export const getAdminMemberDetail = (memberId: number): Promise<ApiResponse<AdminMemberDetail>> =>
  apiClient
    .get<ApiResponse<AdminMemberDetail>>(`/v1/admin/members/${memberId}`)
    .then((r) => r.data);

export const getCandidateGenderCount = (): Promise<ApiResponse<CandidateGenderCountResponse>> =>
  apiClient
    .get<ApiResponse<CandidateGenderCountResponse>>('/v1/admin/statistics/candidates/gender-count')
    .then((r) => r.data);

export const registerAnnouncement = (body: AnnouncementRegisterRequest): Promise<ApiResponse<number>> =>
  apiClient
    .post<ApiResponse<number>>('/v1/admin/announcements', body)
    .then((r) => r.data);

export const getAdminMatchingApplications = (params?: { page?: number; size?: number }): Promise<ApiResponse<PageResponse<AdminMatchingApplicationItem>>> =>
  apiClient
    .get<ApiResponse<PageResponse<AdminMatchingApplicationItem>>>('/v1/admin/matching-applications', { params })
    .then((r) => r.data);
