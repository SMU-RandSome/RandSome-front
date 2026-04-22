import { apiClient } from '@/lib/axios';
import type { ApiResponse, CouponEventDetailItem, CouponEventPreviewItem, CouponItem, CursorSlice } from '@/types';

export const getCoupons = (params?: {
  filter?: 'AVAILABLE' | 'USED_OR_EXPIRED' | 'ALL';
  lastCouponId?: number;
  size?: number;
}): Promise<ApiResponse<CursorSlice<CouponItem>>> =>
  apiClient
    .get<ApiResponse<CursorSlice<CouponItem>>>('/v1/coupons', { params })
    .then((r) => r.data);

export const useCoupon = (couponId: number): Promise<ApiResponse<null>> =>
  apiClient.post<ApiResponse<null>>(`/v1/coupons/${couponId}/use`).then((r) => r.data);

export const getCouponEvents = (): Promise<ApiResponse<CouponEventPreviewItem[]>> =>
  apiClient.get<ApiResponse<CouponEventPreviewItem[]>>('/v1/coupon-events').then((r) => r.data);

export const getCouponEvent = (eventId: number): Promise<ApiResponse<CouponEventDetailItem>> =>
  apiClient.get<ApiResponse<CouponEventDetailItem>>(`/v1/coupon-events/${eventId}`).then((r) => r.data);

export const issueCouponEvent = (couponEventId: number): Promise<ApiResponse<number>> =>
  apiClient
    .post<ApiResponse<number>>(`/v1/coupon-events/${couponEventId}/issue`)
    .then((r) => r.data);
