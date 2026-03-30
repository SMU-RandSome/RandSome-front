import { apiClient } from '@/lib/axios';
import type {
  ApiResponse,
  AdminMemberListItem,
  AdminMemberDetail,
  PageResponse,
  PaymentRejectRequest,
  PaymentPreviewItem,
  PaymentFilterStatus,
  CandidateGenderCountResponse,
  PaymentStatusStatisticsResponse,
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

export const confirmPayment = (paymentId: number): Promise<ApiResponse<null>> =>
  apiClient
    .post<ApiResponse<null>>(`/v1/admin/payments/${paymentId}/confirm`)
    .then((r) => r.data);

export const rejectPayment = (paymentId: number, body: PaymentRejectRequest): Promise<ApiResponse<null>> =>
  apiClient
    .post<ApiResponse<null>>(`/v1/admin/payments/${paymentId}/reject`, body)
    .then((r) => r.data);

export const getAdminPayments = (
  filterStatus: PaymentFilterStatus,
  params?: { page?: number; size?: number },
): Promise<ApiResponse<PageResponse<PaymentPreviewItem>>> =>
  apiClient
    .get<ApiResponse<PageResponse<PaymentPreviewItem>>>('/v1/admin/payments', {
      params: { filterStatus, ...params },
    })
    .then((r) => r.data);

export const getCandidateGenderCount = (): Promise<ApiResponse<CandidateGenderCountResponse>> =>
  apiClient
    .get<ApiResponse<CandidateGenderCountResponse>>('/v1/admin/statistics/candidates/gender-count')
    .then((r) => r.data);

export const getPaymentStatusStatistics = (): Promise<ApiResponse<PaymentStatusStatisticsResponse>> =>
  apiClient
    .get<ApiResponse<PaymentStatusStatisticsResponse>>('/v1/admin/statistics/payments/status-count')
    .then((r) => r.data);

export const registerAnnouncement = (body: AnnouncementRegisterRequest): Promise<ApiResponse<number>> =>
  apiClient
    .post<ApiResponse<number>>('/v1/admin/announcements', body)
    .then((r) => r.data);
