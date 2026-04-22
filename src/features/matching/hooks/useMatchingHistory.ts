import { useQuery } from '@tanstack/react-query';
import { getMatchingHistory } from '../api';
import type { MatchingHistoryItem } from '@/types';

export const useMatchingHistory = (): {
  items: MatchingHistoryItem[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
} => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['matchingHistory'],
    queryFn: async (): Promise<MatchingHistoryItem[]> => {
      const res = await getMatchingHistory();
      return res.data ?? [];
    },
    staleTime: 1000 * 60 * 2, // 2분
    gcTime: 1000 * 60 * 10, // 10분
  });

  return { items: data ?? [], isLoading, isError, refetch };
};
