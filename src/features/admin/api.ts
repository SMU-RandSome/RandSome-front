import { apiClient } from '@/lib/axios';
import type {
  ApiResponse,
  AdminMemberListItem,
  AdminMemberDetail,
  PageResponse,
  PaymentRejectRequest,
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
