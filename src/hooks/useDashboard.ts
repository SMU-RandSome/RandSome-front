import { useQuery } from '@tanstack/react-query';
import type { DashboardResponse } from '@/types';
import { apiClient } from '@/lib/axios';

const fetchDashboard = async (): Promise<DashboardResponse | null> => {
  const res = await apiClient.get<{ result: string; data: DashboardResponse | null }>(
    '/v1/statistics/dashboard',
  );
  return res.data.data;
};

export const useDashboard = (): { stats: DashboardResponse | null; isLoading: boolean } => {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
    // staleTime은 App.tsx QueryClient 전역 기본값(5분) 상속
  });

  return { stats: data ?? null, isLoading };
};
