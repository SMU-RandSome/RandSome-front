import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCoupon } from '../api';
import { getApiErrorMessage } from '@/lib/axios';
import { useToast } from '@/components/ui/Toast';

export const useUseCouponMutation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (couponId: number) => useCoupon(couponId),
    onSuccess: () => {
      toast('쿠폰이 사용되었습니다! 티켓이 지급됩니다 🎟️', 'success');
    },
    onError: (err: unknown) => {
      toast(getApiErrorMessage(err), 'error');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      queryClient.invalidateQueries({ queryKey: ['ticketBalance'] });
    },
  });
};
