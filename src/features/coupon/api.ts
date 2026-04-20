import { apiClient } from '@/lib/axios';
import type { ApiResponse, CouponEventDetailItem, CouponItem, CursorPageResponse } from '@/types';

export const getCoupons = (cursor?: string, limit = 20): Promise<ApiResponse<CursorPageResponse<CouponItem>>> =>
  apiClient
    .get<ApiResponse<CursorPageResponse<CouponItem>>>('/v1/coupons', {
      params: { cursor, limit },
    })
    .then((r) => r.data);

export const useCoupon = (couponId: number): Promise<ApiResponse<null>> =>
  apiClient.post<ApiResponse<null>>(`/v1/coupons/${couponId}/use`).then((r) => r.data);

export const getCouponEvent = (eventId: number): Promise<ApiResponse<CouponEventDetailItem>> =>
  apiClient.get<ApiResponse<CouponEventDetailItem>>(`/v1/coupon-events/${eventId}`).then((r) => r.data);

export const claimCouponEvent = (eventId: number, secretCode?: string): Promise<ApiResponse<null>> =>
  apiClient
    .post<ApiResponse<null>>(`/v1/coupon-events/${eventId}/claim`, secretCode ? { secretCode } : {})
    .then((r) => r.data);
