import { renderHook } from '@testing-library/react';
import { useFcmToken } from '@/hooks/useFcmToken';

// registerFcmToken을 모킹하기 위해 모듈 자체를 모킹
const mockRegisterFcmToken = vi.fn().mockResolvedValue('success');

vi.mock('@/hooks/useFcmToken', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks/useFcmToken')>();
  return {
    ...actual,
    registerFcmToken: (...args: unknown[]) => mockRegisterFcmToken(...args),
  };
});

vi.mock('@/lib/firebase', () => ({
  getFirebaseMessaging: vi.fn().mockResolvedValue(null),
}));

vi.mock('@/features/member/api', () => ({
  syncDeviceToken: vi.fn().mockResolvedValue(undefined),
  deleteDeviceToken: vi.fn().mockResolvedValue(undefined),
}));

describe('useFcmToken', () => {
  const originalNotification = globalThis.Notification;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Notification mock
    Object.defineProperty(globalThis, 'Notification', {
      writable: true,
      value: { permission: 'granted' },
    });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'Notification', {
      writable: true,
      value: originalNotification,
    });
  });

  it('isAuthenticated가 false이면 토큰 등록을 시도하지 않음', () => {
    renderHook(() => useFcmToken(false));
    expect(mockRegisterFcmToken).not.toHaveBeenCalled();
  });

  it('Notification permission이 granted가 아니면 토큰 등록을 시도하지 않음', () => {
    Object.defineProperty(globalThis, 'Notification', {
      writable: true,
      value: { permission: 'denied' },
    });
    localStorage.setItem('fcmEnabled', 'true');
    renderHook(() => useFcmToken(true));
    expect(mockRegisterFcmToken).not.toHaveBeenCalled();
  });

  it('fcmEnabled가 true가 아니면 토큰 등록을 시도하지 않음', () => {
    localStorage.setItem('fcmEnabled', 'false');
    renderHook(() => useFcmToken(true));
    expect(mockRegisterFcmToken).not.toHaveBeenCalled();
  });

  it('unmount 시 cleanup이 실행됨 (에러 무시)', () => {
    localStorage.setItem('fcmEnabled', 'true');
    const { unmount } = renderHook(() => useFcmToken(true));
    // unmount가 에러 없이 완료되어야 함
    expect(() => unmount()).not.toThrow();
  });
});
