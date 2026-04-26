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
    staleTime: 1000 * 60 * 5,  // 5분 — 관리자 대시보드는 실시간 불필요
    gcTime: 1000 * 60 * 30,
  });

  return { stats: data ?? null, isLoading };
};
