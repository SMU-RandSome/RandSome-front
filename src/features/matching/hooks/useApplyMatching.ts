import { useMutation, useQueryClient } from '@tanstack/react-query';
import { applyMatching } from '../api';
import { getApiErrorMessage } from '@/lib/axios';
import { useToast } from '@/components/ui/Toast';
import type { MatchingApplicationRequest } from '@/types';

export const useApplyMatching = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (body: MatchingApplicationRequest) => applyMatching(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticketBalance'] });
      queryClient.invalidateQueries({ queryKey: ['matchingHistory'] });
    },
    onError: (err: unknown) => {
      toast(getApiErrorMessage(err), 'error');
    },
  });
};
