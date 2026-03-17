import { renderHook, act } from '@testing-library/react';
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

describe('useFeed', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockGetFeed.mockResolvedValue({ result: 'SUCCESS', data: mockFeed, error: null });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('초기 상태: feed 비어있고 isLoading true', () => {
    const { result } = renderHook(() => useFeed());

    expect(result.current.feed).toHaveLength(0);
    expect(result.current.isLoading).toBe(true);
  });

  it('API 응답 후 feed 세팅 및 isLoading false', async () => {
    const { result } = renderHook(() => useFeed());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.feed).toHaveLength(2);
  });

  it('마운트 시 getFeed 1회 호출', async () => {
    renderHook(() => useFeed());

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockGetFeed).toHaveBeenCalledTimes(1);
    expect(mockGetFeed).toHaveBeenCalledWith({ size: 20 });
  });

  it('10초마다 폴링 — 10초 후 getFeed 추가 호출', async () => {
    renderHook(() => useFeed());

    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      vi.advanceTimersByTime(10_000);
      await Promise.resolve();
    });

    expect(mockGetFeed).toHaveBeenCalledTimes(2);
  });

  it('20초 후 getFeed 총 3회 호출', async () => {
    renderHook(() => useFeed());

    await act(async () => { await Promise.resolve(); });

    await act(async () => {
      vi.advanceTimersByTime(20_000);
      await Promise.resolve();
    });

    expect(mockGetFeed).toHaveBeenCalledTimes(3);
  });

  it('언마운트 시 폴링 정리 (이후 추가 호출 없음)', async () => {
    const { unmount } = renderHook(() => useFeed());

    await act(async () => { await Promise.resolve(); });

    unmount();
    const callCount = mockGetFeed.mock.calls.length;

    await act(async () => {
      vi.advanceTimersByTime(30_000);
      await Promise.resolve();
    });

    expect(mockGetFeed).toHaveBeenCalledTimes(callCount);
  });

  it('API 오류 시 빈 피드 유지 및 isLoading false', async () => {
    mockGetFeed.mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useFeed());

    await act(async () => { await Promise.resolve(); });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.feed).toHaveLength(0);
  });

  it('feed 항목은 id, eventType, nickname, createdAt 필드를 가짐', async () => {
    const { result } = renderHook(() => useFeed());

    await act(async () => { await Promise.resolve(); });

    const item = result.current.feed[0];
    expect(item).toHaveProperty('id');
    expect(item).toHaveProperty('eventType');
    expect(item).toHaveProperty('nickname');
    expect(item).toHaveProperty('createdAt');
  });
});
