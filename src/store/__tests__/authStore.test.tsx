import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/store/authStore';
import type { AuthUser } from '@/types';

const mockUser: AuthUser = {
  id: 1,
  email: 'test@sangmyung.kr',
  nickname: '행복한 쿼카',
  legalName: '홍길동',
  mbti: 'ENFP',
  gender: 'MALE',
  role: 'ROLE_MEMBER',
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('authStore', () => {
  it('초기 상태: 인증 안 됨, user null', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('setUser 호출 시 user 설정 및 isAuthenticated true', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.setUser(mockUser);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
  });

  it('logout 호출 시 user null, isAuthenticated false', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.setUser(mockUser);
    });
    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('logout 시 localStorage accessToken 제거', () => {
    localStorage.setItem('accessToken', 'dummy-token');
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.logout();
    });

    expect(localStorage.getItem('accessToken')).toBeNull();
  });

  it('ROLE_ADMIN user로 setUser 가능', () => {
    const adminUser: AuthUser = { ...mockUser, role: 'ROLE_ADMIN' };
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.setUser(adminUser);
    });

    expect(result.current.user?.role).toBe('ROLE_ADMIN');
  });

  it('AuthProvider 외부에서 useAuth 호출 시 에러', () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth must be used within an AuthProvider',
    );
  });
});
