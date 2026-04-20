import { useState, useEffect } from 'react';
import { getTicketBalance } from '@/features/ticket/api';
import type { TicketBalanceResponse } from '@/types';

export const useTicketBalance = (): { balance: TicketBalanceResponse | null; isLoading: boolean; refetch: () => void } => {
  const [balance, setBalance] = useState<TicketBalanceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [key, setKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    getTicketBalance()
      .then((res) => {
        if (!cancelled) setBalance(res.data);
      })
      .catch(() => {
        if (!cancelled) setBalance(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [key]);

  const refetch = (): void => setKey((k) => k + 1);

  return { balance, isLoading, refetch };
};
