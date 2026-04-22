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
    gcTime: 1000 * 60 * 30, // 30분
  });

  return { stats: data ?? null, isLoading };
};
