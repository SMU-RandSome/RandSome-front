import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { unregisterFcmToken } from '@/hooks/useFcmToken';
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
    unregisterFcmToken().catch(() => {});
  }, []);

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
