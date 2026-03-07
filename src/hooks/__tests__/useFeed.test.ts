import { renderHook, act } from '@testing-library/react';
import { useFeed } from '@/hooks/useFeed';

describe('useFeed', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('초기 상태: feed 비어있고 isLoading true', () => {
    const { result } = renderHook(() => useFeed());

    expect(result.current.feed).toHaveLength(0);
    expect(result.current.isLoading).toBe(true);
  });

  it('1500ms 후 초기 피드 5개 로드 및 isLoading false', () => {
    const { result } = renderHook(() => useFeed());

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.feed).toHaveLength(5);
  });

  it('로드 전 500ms에는 아직 isLoading true', () => {
    const { result } = renderHook(() => useFeed());

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.feed).toHaveLength(0);
  });

  it('로드 후 5000ms마다 새 피드 항목이 1개 추가됨', () => {
    const { result } = renderHook(() => useFeed());

    act(() => {
      vi.advanceTimersByTime(1500);
    });
    const afterLoad = result.current.feed.length;

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.feed.length).toBe(afterLoad + 1);
  });

  it('피드 최대 20개 제한', () => {
    const { result } = renderHook(() => useFeed());

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    // 20개 초과가 될 때까지 인터벌 실행
    act(() => {
      vi.advanceTimersByTime(5000 * 30);
    });

    expect(result.current.feed.length).toBeLessThanOrEqual(20);
  });

  it('각 피드 항목은 id, type, name, time 필드를 가짐', () => {
    const { result } = renderHook(() => useFeed());

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    const item = result.current.feed[0];
    expect(item).toHaveProperty('id');
    expect(item).toHaveProperty('type');
    expect(item).toHaveProperty('name');
    expect(item).toHaveProperty('time');
  });

  it("피드 type은 'register' 또는 'match'", () => {
    const { result } = renderHook(() => useFeed());

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    for (const item of result.current.feed) {
      expect(['register', 'match']).toContain(item.type);
    }
  });

  it('언마운트 시 타이머 정리 (메모리 누수 없음)', () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval');

    const { unmount } = renderHook(() => useFeed());

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});
