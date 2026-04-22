import { useMutation, useQueryClient } from '@tanstack/react-query';
import { checkAttendance } from '../api';
import { getApiErrorMessage } from '@/lib/axios';
import { useToast } from '@/components/ui/Toast';

export const useCheckAttendance = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => checkAttendance(),
    onSuccess: () => {
      toast('출석 완료! 티켓이 지급되었습니다 🎟️', 'success');
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['ticketBalance'] });
    },
    onError: (err: unknown) => {
      toast(getApiErrorMessage(err), 'error');
    },
  });
};
