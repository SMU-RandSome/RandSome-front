import React, { createContext, useContext, useState, ReactNode } from 'react';
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

  const setUser = (authUser: AuthUser): void => {
    setUserState(authUser);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));
  };

  const logout = (): void => {
    setUserState(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem('fcmToken');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: user !== null, setUser, logout }}>
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
