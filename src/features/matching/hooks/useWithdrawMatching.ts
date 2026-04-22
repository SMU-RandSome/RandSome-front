import { useMutation, useQueryClient } from '@tanstack/react-query';
import { withdrawMatching } from '../api';
import { getApiErrorMessage } from '@/lib/axios';
import { useToast } from '@/components/ui/Toast';

export const useWithdrawMatching = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (applicationId: number) => withdrawMatching(applicationId),
    onSuccess: () => {
      toast('신청이 취소되었습니다', 'success');
      queryClient.invalidateQueries({ queryKey: ['matchingHistory'] });
      queryClient.invalidateQueries({ queryKey: ['ticketBalance'] });
    },
    onError: (err: unknown) => {
      toast(getApiErrorMessage(err), 'error');
    },
  });
};
