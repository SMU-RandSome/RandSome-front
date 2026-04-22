import { apiClient } from '@/lib/axios';
import type {
  ApiResponse,
  AdminMemberListItem,
  AdminMemberDetail,
  AdminMatchingItem,
  PageResponse,
  CursorSlice,
  CandidateGenderCountResponse,
  AnnouncementRegisterRequest,
  AdminQrVerifyRequest,
  CouponEventRegisterRequest,
  CouponEventUpdateRequest,
  CouponEventPreviewItem,
  AdminReportListItem,
  AdminReportDetailResponse,
  ReportStatusFilter,
  AdminCandidateRegistrationItem,
  CandidateRegistrationFilter,
  RestrictionRequest,
  Gender,
} from '@/types';

export const getAdminMembers = (params?: { page?: number; size?: number }): Promise<ApiResponse<PageResponse<AdminMemberListItem>>> =>
  apiClient
    .get<ApiResponse<PageResponse<AdminMemberListItem>>>('/v1/admin/members', { params })
    .then((r) => r.data);

export const getAdminMemberDetail = (memberId: number): Promise<ApiResponse<AdminMemberDetail>> =>
  apiClient
    .get<ApiResponse<AdminMemberDetail>>(`/v1/admin/members/${memberId}`)
    .then((r) => r.data);

export const suspendAdminMember = (memberId: number, body: RestrictionRequest): Promise<ApiResponse<null>> =>
  apiClient
    .post<ApiResponse<null>>(`/v1/admin/members/${memberId}/suspensions`, body)
    .then((r) => r.data);

// --- 후보자 등록 관리 ---

export const getAdminCandidateRegistrations = (params?: {
  filter?: CandidateRegistrationFilter;
  keyword?: string;
  lastId?: number;
  size?: number;
}): Promise<ApiResponse<CursorSlice<AdminCandidateRegistrationItem>>> =>
  apiClient
    .get<ApiResponse<CursorSlice<AdminCandidateRegistrationItem>>>('/v1/admin/candidate-registrations', { params })
    .then((r) => r.data);

export const approveAdminCandidateRegistration = (candidateRegistrationId: number): Promise<ApiResponse<null>> =>
  apiClient
    .post<ApiResponse<null>>(`/v1/admin/candidate-registrations/${candidateRegistrationId}/approve`)
    .then((r) => r.data);

export const rejectAdminCandidateRegistration = (
  candidateRegistrationId: number,
  body: { reason: string },
): Promise<ApiResponse<null>> =>
  apiClient
    .post<ApiResponse<null>>(`/v1/admin/candidate-registrations/${candidateRegistrationId}/reject`, body)
    .then((r) => r.data);

export const getCandidateGenderCount = (): Promise<ApiResponse<CandidateGenderCountResponse>> =>
  apiClient
    .get<ApiResponse<CandidateGenderCountResponse>>('/v1/admin/statistics/candidates/gender-count')
    .then((r) => r.data);

export const registerAnnouncement = (body: AnnouncementRegisterRequest): Promise<ApiResponse<number>> =>
  apiClient
    .post<ApiResponse<number>>('/v1/admin/announcements', body)
    .then((r) => r.data);

export const getAdminMatchingApplications = (params?: {
  date?: string;
  gender?: Gender;
  keyword?: string;
  sort?: 'LATEST' | 'OLDEST';
  page?: number;
  size?: number;
}): Promise<ApiResponse<PageResponse<AdminMatchingItem>>> =>
  apiClient
    .get<ApiResponse<PageResponse<AdminMatchingItem>>>('/v1/admin/matching-applications', { params })
    .then((r) => r.data);

export const verifyQrCode = (body: AdminQrVerifyRequest): Promise<ApiResponse<void>> =>
  apiClient
    .post<ApiResponse<void>>('/v1/admin/qr/verify', body)
    .then((r) => r.data);

// --- 쿠폰 이벤트 관리 ---

export const getAdminCouponEvents = (params?: { page?: number; size?: number }): Promise<ApiResponse<PageResponse<CouponEventPreviewItem>>> =>
  apiClient
    .get<ApiResponse<PageResponse<CouponEventPreviewItem>>>('/v1/admin/coupon-events', { params })
    .then((r) => r.data);

export const createAdminCouponEvent = (body: CouponEventRegisterRequest): Promise<ApiResponse<number>> =>
  apiClient
    .post<ApiResponse<number>>('/v1/admin/coupon-events', body)
    .then((r) => r.data);

export const updateAdminCouponEvent = (eventId: number, body: CouponEventUpdateRequest): Promise<ApiResponse<null>> =>
  apiClient
    .patch<ApiResponse<null>>(`/v1/admin/coupon-events/${eventId}`, body)
    .then((r) => r.data);

export const deleteAdminCouponEvent = (eventId: number): Promise<ApiResponse<null>> =>
  apiClient
    .delete<ApiResponse<null>>(`/v1/admin/coupon-events/${eventId}`)
    .then((r) => r.data);

export const activateAdminCouponEvent = (eventId: number): Promise<ApiResponse<null>> =>
  apiClient
    .post<ApiResponse<null>>(`/v1/admin/coupon-events/${eventId}/activate`)
    .then((r) => r.data);

export const deactivateAdminCouponEvent = (eventId: number): Promise<ApiResponse<null>> =>
  apiClient
    .post<ApiResponse<null>>(`/v1/admin/coupon-events/${eventId}/deactivate`)
    .then((r) => r.data);

// --- 신고 관리 ---

export const getAdminReports = (params?: { statusFilter?: ReportStatusFilter }): Promise<ApiResponse<AdminReportListItem[]>> =>
  apiClient
    .get<ApiResponse<AdminReportListItem[]>>('/v1/admin/reports', { params })
    .then((r) => r.data);

export const getAdminReportDetail = (reportId: number): Promise<ApiResponse<AdminReportDetailResponse>> =>
  apiClient
    .get<ApiResponse<AdminReportDetailResponse>>(`/v1/admin/reports/${reportId}`)
    .then((r) => r.data);

export const resolveAdminReport = (reportId: number): Promise<ApiResponse<null>> =>
  apiClient
    .post<ApiResponse<null>>(`/v1/admin/reports/${reportId}/resolve`)
    .then((r) => r.data);

export const rejectAdminReport = (reportId: number): Promise<ApiResponse<null>> =>
  apiClient
    .post<ApiResponse<null>>(`/v1/admin/reports/${reportId}/reject`)
    .then((r) => r.data);

export const restoreAdminMember = (memberId: number): Promise<ApiResponse<null>> =>
  apiClient
    .post<ApiResponse<null>>(`/v1/admin/reports/members/${memberId}/restore`)
    .then((r) => r.data);
