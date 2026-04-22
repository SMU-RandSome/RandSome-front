import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFeed } from '@/hooks/useFeed';
import type { FeedItem } from '@/types';

const mockFeed: FeedItem[] = [
  { id: 1, eventType: 'CANDIDATE_REGISTERED', nickname: '행복한 쿼카', createdAt: new Date().toISOString() },
  { id: 2, eventType: 'MATCH_REQUESTED', nickname: '즐거운 사자', requestCount: 2, createdAt: new Date().toISOString() },
];

vi.mock('@/features/feed/api', () => ({
  getFeed: vi.fn(),
}));

import { getFeed } from '@/features/feed/api';
const mockGetFeed = vi.mocked(getFeed);

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
  return { wrapper: Wrapper, queryClient };
};

describe('useFeed', () => {
  beforeEach(() => {
    mockGetFeed.mockResolvedValue({ result: 'SUCCESS', data: mockFeed, error: null });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('초기 상태: feed 비어있고 isLoading true', () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useFeed(), { wrapper });

    expect(result.current.feed).toHaveLength(0);
    expect(result.current.isLoading).toBe(true);
  });

  it('API 응답 후 feed 세팅 및 isLoading false', async () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useFeed(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.feed).toHaveLength(2);
  });

  it('마운트 시 getFeed 1회 호출', async () => {
    const { wrapper } = createWrapper();
    renderHook(() => useFeed(), { wrapper });

    await waitFor(() => expect(mockGetFeed).toHaveBeenCalledTimes(1));
  });

  it('API 오류 시 빈 피드 유지 및 isLoading false', async () => {
    mockGetFeed.mockRejectedValue(new Error('Network error'));
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useFeed(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.feed).toHaveLength(0);
  });

  it('feed 항목은 id, eventType, nickname, createdAt 필드를 가짐', async () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useFeed(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const item = result.current.feed[0];
    expect(item).toHaveProperty('id');
    expect(item).toHaveProperty('eventType');
    expect(item).toHaveProperty('nickname');
    expect(item).toHaveProperty('createdAt');
  });

  describe('폴링 타이머', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('60초마다 폴링 — 60초 후 getFeed 추가 호출', async () => {
      const { wrapper } = createWrapper();
      renderHook(() => useFeed(), { wrapper });

      await act(async () => { await Promise.resolve(); });

      await act(async () => {
        vi.advanceTimersByTime(60_000);
        await Promise.resolve();
      });

      expect(mockGetFeed).toHaveBeenCalledTimes(2);
    });

    it('120초 후 getFeed 총 3회 호출', async () => {
      const { wrapper } = createWrapper();
      renderHook(() => useFeed(), { wrapper });

      await act(async () => { await Promise.resolve(); });

      await act(async () => {
        vi.advanceTimersByTime(60_000);
        await Promise.resolve();
      });
      await act(async () => {
        vi.advanceTimersByTime(60_000);
        await Promise.resolve();
      });

      expect(mockGetFeed).toHaveBeenCalledTimes(3);
    });

    it('언마운트 시 폴링 정리 (이후 추가 호출 없음)', async () => {
      const { wrapper, queryClient } = createWrapper();
      const { unmount } = renderHook(() => useFeed(), { wrapper });

      await act(async () => { await Promise.resolve(); });

      unmount();
      queryClient.clear();
      const callCount = mockGetFeed.mock.calls.length;

      await act(async () => {
        vi.advanceTimersByTime(30_000);
        await Promise.resolve();
      });

      expect(mockGetFeed).toHaveBeenCalledTimes(callCount);
    });
  });
});
