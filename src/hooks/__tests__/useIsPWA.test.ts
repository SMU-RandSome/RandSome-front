import { renderHook } from '@testing-library/react';
import { useIsPWA } from '@/hooks/useIsPWA';

const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

describe('useIsPWA', () => {
  afterEach(() => {
    // setup.ts의 기본 mock으로 복원 (matches: false)
    mockMatchMedia(false);
  });

  it('기본 상태에서 false 반환 (일반 브라우저)', () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useIsPWA());

    expect(result.current).toBe(false);
  });

  it('standalone(PWA) 모드에서 true 반환', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useIsPWA());

    expect(result.current).toBe(true);
  });

  it('matchMedia 이벤트 리스너를 등록함', () => {
    const addEventListenerMock = vi.fn();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: addEventListenerMock,
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    renderHook(() => useIsPWA());

    // standalone + mobile 두 미디어 쿼리 각각 addEventListener 호출
    expect(addEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('언마운트 시 이벤트 리스너 제거 (메모리 누수 없음)', () => {
    const removeEventListenerMock = vi.fn();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: removeEventListenerMock,
        dispatchEvent: vi.fn(),
      })),
    });

    const { unmount } = renderHook(() => useIsPWA());
    unmount();

    expect(removeEventListenerMock).toHaveBeenCalled();
  });
});
