import { useMutation, useQueryClient } from '@tanstack/react-query';
import { registerCandidate } from '../api';
import { getApiErrorMessage } from '@/lib/axios';
import { useToast } from '@/components/ui/Toast';

export const useRegisterCandidate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => registerCandidate(),
    onSuccess: () => {
      toast('후보 등록 신청이 완료되었습니다!', 'success');
      queryClient.invalidateQueries({ queryKey: ['ticketBalance'] });
    },
    onError: (err: unknown) => {
      toast(getApiErrorMessage(err), 'error');
    },
  });
};
