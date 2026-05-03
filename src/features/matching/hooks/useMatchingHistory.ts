import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { getMatchingHistory } from '../api';
import type { MatchingHistoryItem } from '@/types';

export const useMatchingHistory = (): {
  items: MatchingHistoryItem[];
  isLoading: boolean;
  isError: boolean;
  isServiceNotOpen: boolean;
  refetch: () => void;
} => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['matchingHistory'],
    queryFn: async (): Promise<MatchingHistoryItem[]> => {
      const res = await getMatchingHistory();
      return res.data ?? [];
    },
    staleTime: 1000 * 60 * 2, // 2분
    gcTime: 1000 * 60 * 10, // 10분
    retry: (failureCount, err) => {
      if (axios.isAxiosError(err) && err.response?.status === 403) return false;
      return failureCount < 3;
    },
  });

  const isServiceNotOpen =
    isError &&
    axios.isAxiosError(error) &&
    error.response?.status === 403;

  return { items: data ?? [], isLoading, isError, isServiceNotOpen, refetch };
};
