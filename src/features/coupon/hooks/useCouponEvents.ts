import { useQuery } from '@tanstack/react-query';
import { getCouponEvents } from '../api';
import type { CouponEventPreviewItem } from '@/types';

export const useCouponEvents = (): { events: CouponEventPreviewItem[]; isLoading: boolean } => {
  const { data, isLoading } = useQuery({
    queryKey: ['coupon-events'],
    queryFn: getCouponEvents,
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 30, // 30분
  });
  return {
    events: data?.data ?? [],
    isLoading,
  };
};
