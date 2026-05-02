import { renderHook } from '@testing-library/react';
import { useScrollLock } from '@/hooks/useScrollLock';

describe('useScrollLock', () => {
  beforeEach(() => {
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.touchAction = '';
    document.body.style.overscrollBehavior = '';
    document.documentElement.style.overflow = '';
  });

  it('마운트 시 body를 fixed로 잠근다', () => {
    const { unmount } = renderHook(() => useScrollLock());

    expect(document.body.style.overflow).toBe('hidden');
    expect(document.body.style.position).toBe('fixed');
    expect(document.body.style.width).toBe('100%');
    expect(document.documentElement.style.overflow).toBe('hidden');

    unmount();
  });

  it('언마운트 시 원래 스타일을 복원한다', () => {
    document.body.style.overflow = 'auto';
    document.body.style.position = 'relative';

    const { unmount } = renderHook(() => useScrollLock());
    unmount();

    expect(document.body.style.overflow).toBe('auto');
    expect(document.body.style.position).toBe('relative');
  });

  it('스크롤 위치를 보존한다', () => {
    Object.defineProperty(window, 'scrollY', { value: 200, writable: true, configurable: true });
    const scrollToMock = vi.fn();
    window.scrollTo = scrollToMock as unknown as typeof window.scrollTo;

    const { unmount } = renderHook(() => useScrollLock());

    expect(document.body.style.top).toBe('-200px');

    unmount();

    expect(scrollToMock).toHaveBeenCalledWith(0, 200);
  });

  it('touch-action과 overscroll-behavior를 설정한다', () => {
    const { unmount } = renderHook(() => useScrollLock());

    expect(document.body.style.touchAction).toBe('none');
    expect(document.body.style.overscrollBehavior).toBe('none');

    unmount();
  });

  it('active=false이면 스크롤 잠금을 하지 않는다', () => {
    renderHook(() => useScrollLock(false));

    expect(document.body.style.overflow).toBe('');
    expect(document.body.style.position).toBe('');
  });

  it('active가 true로 바뀌면 스크롤을 잠근다', () => {
    const { rerender } = renderHook(
      ({ active }: { active: boolean }) => useScrollLock(active),
      { initialProps: { active: false } },
    );

    expect(document.body.style.overflow).toBe('');

    rerender({ active: true });

    expect(document.body.style.overflow).toBe('hidden');
    expect(document.body.style.position).toBe('fixed');
  });
});
