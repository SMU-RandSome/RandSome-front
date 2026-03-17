import { useState, useEffect } from 'react';
import type { DashboardResponse } from '@/types';
import { apiClient } from '@/lib/axios';

export const useDashboard = (): { stats: DashboardResponse | null; isLoading: boolean } => {
  const [stats, setStats] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get<{ result: string; data: DashboardResponse | null }>('/v1/statistics/dashboard')
      .then((res) => {
        if (res.data.data) setStats(res.data.data);
      })
      .catch(() => {
        // 오류 시 null 유지
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return { stats, isLoading };
};
