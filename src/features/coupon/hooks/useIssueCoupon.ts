import { useMutation, useQueryClient } from '@tanstack/react-query';
import { issueCouponEvent } from '../api';
import { getApiErrorMessage } from '@/lib/axios';
import { useToast } from '@/components/ui/Toast';
import { useNavigate } from 'react-router-dom';

export const useIssueCoupon = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (couponEventId: number) => issueCouponEvent(couponEventId),
    onSuccess: () => {
      toast('쿠폰이 발급되었습니다! 쿠폰함을 확인해주세요 🎟️', 'success');
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      queryClient.invalidateQueries({ queryKey: ['coupon-events'] });
      queryClient.invalidateQueries({ queryKey: ['ticketBalance'] });
      navigate('/coupons');
    },
    onError: (err: unknown) => {
      toast(getApiErrorMessage(err), 'error');
    },
  });
};
