import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, ReactNode } from 'react';
import { unregisterFcmToken, clearFcmToken } from '@/hooks/useFcmToken';
import { refreshAccessToken } from '@/lib/axios';
import type { AuthUser, UserRole, Gender } from '@/types';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setUser: (user: AuthUser) => void;
  logout: () => void;
}

const AUTH_USER_KEY = 'authUser';

const VALID_ROLES: readonly UserRole[] = ['ROLE_MEMBER', 'ROLE_CANDIDATE', 'ROLE_ADMIN'];
const VALID_GENDERS: readonly Gender[] = ['MALE', 'FEMALE'];

const isValidAuthUser = (data: unknown): data is AuthUser => {
  if (!data || typeof data !== 'object') return false;
  const u = data as Record<string, unknown>;
  return (
    typeof u.id === 'number' &&
    typeof u.email === 'string' &&
    u.email.endsWith('@sangmyung.kr') &&
    typeof u.nickname === 'string' &&
    typeof u.mbti === 'string' &&
    VALID_GENDERS.includes(u.gender as Gender) &&
    VALID_ROLES.includes(u.role as UserRole)
  );
};

const isAccessTokenExpired = (): boolean => {
  const token = localStorage.getItem('accessToken');
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1])) as { exp?: number };
    return Date.now() / 1000 >= (payload.exp ?? 0);
  } catch {
    return true;
  }
};

const getStoredUser = (): AuthUser | null => {
  try {
    const stored = localStorage.getItem(AUTH_USER_KEY);
    if (!stored) return null;
    const parsed: unknown = JSON.parse(stored);
    if (!isValidAuthUser(parsed)) {
      localStorage.removeItem(AUTH_USER_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<AuthUser | null>(getStoredUser);

  // useCallback으로 안정적인 참조 유지 — useAuth() 소비자의 불필요한 리렌더링 방지
  const setUser = useCallback((authUser: AuthUser): void => {
    setUserState(authUser);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));
  }, []);

  const logout = useCallback((): void => {
    setUserState(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem(AUTH_USER_KEY);
    clearFcmToken(); // 즉시 동기 삭제 (로컬 캐시)
    unregisterFcmToken({ preservePreference: true }).catch(() => {}); // 비동기 서버 정리 (알림 설정은 보존)
  }, []);

  // 앱 마운트 및 탭 복귀 시 access token 만료 여부를 미리 확인하고 갱신
  useEffect(() => {
    const tryRefresh = async (): Promise<void> => {
      if (!localStorage.getItem('refreshToken')) return;
      if (!isAccessTokenExpired()) return;

      try {
        await refreshAccessToken();
      } catch {
        logout();
      }
    };

    tryRefresh();

    const handleVisibility = (): void => {
      if (document.visibilityState === 'visible') void tryRefresh();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [logout]);

  // useMemo로 context 값 안정화 — user 변경 시에만 하위 트리 리렌더링
  const value = useMemo(
    () => ({ user, isAuthenticated: user !== null, setUser, logout }),
    [user, setUser, logout],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
