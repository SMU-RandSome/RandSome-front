import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getTicketBalance } from '@/features/ticket/api';
import type { TicketBalanceResponse } from '@/types';

const TICKET_BALANCE_KEY = ['ticketBalance'] as const;

export const useTicketBalance = (): {
  balance: TicketBalanceResponse | null;
  isLoading: boolean;
  refetch: () => void;
} => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: TICKET_BALANCE_KEY,
    queryFn: async (): Promise<TicketBalanceResponse | null> => {
      const res = await getTicketBalance();
      return res.data ?? null;
    },
    staleTime: 1000 * 60 * 2, // 2분
    gcTime: 1000 * 60 * 10, // 10분
  });

  const refetch = (): void => {
    queryClient.invalidateQueries({ queryKey: TICKET_BALANCE_KEY });
  };

  return { balance: data ?? null, isLoading, refetch };
};
