import { renderHook } from '@testing-library/react';
import { useScrollLock } from '@/hooks/useScrollLock';

describe('useScrollLock', () => {
  beforeEach(() => {
    document.body.style.overflow = '';
    document.body.style.overscrollBehavior = '';
    document.documentElement.style.overflow = '';
  });

  it('마운트 시 body와 html에 overflow:hidden을 설정한다', () => {
    const { unmount } = renderHook(() => useScrollLock());

    expect(document.body.style.overflow).toBe('hidden');
    expect(document.documentElement.style.overflow).toBe('hidden');

    unmount();
  });

  it('body에 position:fixed를 사용하지 않는다', () => {
    const { unmount } = renderHook(() => useScrollLock());

    expect(document.body.style.position).not.toBe('fixed');

    unmount();
  });

  it('overscroll-behavior를 none으로 설정한다', () => {
    const { unmount } = renderHook(() => useScrollLock());

    expect(document.body.style.overscrollBehavior).toBe('none');

    unmount();
  });

  it('언마운트 시 원래 스타일을 복원한다', () => {
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'visible';

    const { unmount } = renderHook(() => useScrollLock());
    unmount();

    expect(document.body.style.overflow).toBe('auto');
    expect(document.documentElement.style.overflow).toBe('visible');
  });

  it('touchmove 이벤트 리스너를 등록하고 해제한다', () => {
    const addSpy = vi.spyOn(document, 'addEventListener');
    const removeSpy = vi.spyOn(document, 'removeEventListener');

    const { unmount } = renderHook(() => useScrollLock());

    expect(addSpy).toHaveBeenCalledWith('touchmove', expect.any(Function), { passive: false });

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('touchmove', expect.any(Function));

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('active=false이면 스크롤 잠금을 하지 않는다', () => {
    renderHook(() => useScrollLock(false));

    expect(document.body.style.overflow).toBe('');
  });

  it('active가 true로 바뀌면 스크롤을 잠근다', () => {
    const { rerender } = renderHook(
      ({ active }: { active: boolean }) => useScrollLock(active),
      { initialProps: { active: false } },
    );

    expect(document.body.style.overflow).toBe('');

    rerender({ active: true });

    expect(document.body.style.overflow).toBe('hidden');
  });
});
