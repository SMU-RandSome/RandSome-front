import { apiClient } from '@/lib/axios';
import type {
  ApiResponse,
  AdminMemberListItem,
  AdminMemberDetail,
  AdminMatchingApplicationItem,
  PageResponse,
  CandidateGenderCountResponse,
  AnnouncementRegisterRequest,
  ReportItem,
  ReportDetailItem,
  ReportStatus,
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

export const getAdminReports = (params?: { status?: ReportStatus; page?: number; size?: number }): Promise<ApiResponse<PageResponse<ReportItem>>> =>
  apiClient
    .get<ApiResponse<PageResponse<ReportItem>>>('/v1/admin/reports', { params })
    .then((r) => r.data);

export const getAdminReportDetail = (reportId: number): Promise<ApiResponse<ReportDetailItem>> =>
  apiClient
    .get<ApiResponse<ReportDetailItem>>(`/v1/admin/reports/${reportId}`)
    .then((r) => r.data);

export const processAdminReport = (reportId: number): Promise<ApiResponse<null>> =>
  apiClient
    .post<ApiResponse<null>>(`/v1/admin/reports/${reportId}/process`)
    .then((r) => r.data);

export const rejectAdminReport = (reportId: number): Promise<ApiResponse<null>> =>
  apiClient
    .post<ApiResponse<null>>(`/v1/admin/reports/${reportId}/reject`)
    .then((r) => r.data);

export const restoreAdminMember = (memberId: number): Promise<ApiResponse<null>> =>
  apiClient
    .post<ApiResponse<null>>(`/v1/admin/members/${memberId}/restore`)
    .then((r) => r.data);
