import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDashboard } from '@/hooks/useDashboard';
import type { DashboardResponse } from '@/types';

vi.mock('@/lib/axios', () => ({
  apiClient: { get: vi.fn() },
}));

import { apiClient } from '@/lib/axios';
const mockGet = vi.mocked(apiClient.get);

const mockStats: DashboardResponse = {
  candidateCount: 42,
  todayMatchingCount: 5,
  totalMatchingCount: 123,
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
  return { wrapper: Wrapper, queryClient };
};

describe('useDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('초기 상태: stats null, isLoading true', () => {
    mockGet.mockResolvedValue({ data: { result: 'SUCCESS', data: mockStats } });
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useDashboard(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.stats).toBeNull();
  });

  it('API 성공 후 stats 세팅 및 isLoading false', async () => {
    mockGet.mockResolvedValue({ data: { result: 'SUCCESS', data: mockStats } });
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useDashboard(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.stats).toEqual(mockStats);
  });

  it('candidateCount, todayMatchingCount, totalMatchingCount 필드 포함', async () => {
    mockGet.mockResolvedValue({ data: { result: 'SUCCESS', data: mockStats } });
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useDashboard(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.stats?.candidateCount).toBe(42);
    expect(result.current.stats?.todayMatchingCount).toBe(5);
    expect(result.current.stats?.totalMatchingCount).toBe(123);
  });

  it('API 오류 시 stats null, isLoading false', async () => {
    mockGet.mockRejectedValue(new Error('Network error'));
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useDashboard(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.stats).toBeNull();
  });

  it('올바른 엔드포인트(/v1/statistics/dashboard) 호출', async () => {
    mockGet.mockResolvedValue({ data: { result: 'SUCCESS', data: mockStats } });
    const { wrapper } = createWrapper();
    renderHook(() => useDashboard(), { wrapper });

    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(1));
    expect(mockGet).toHaveBeenCalledWith('/v1/statistics/dashboard');
  });
});
