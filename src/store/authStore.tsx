import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AuthUser, UserRole, Gender } from '@/types';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
}

const AUTH_USER_KEY = 'authUser';

const VALID_ROLES: readonly UserRole[] = ['ROLE_MEMBER', 'ROLE_CANDIDATE', 'ROLE_ADMIN'];
const VALID_GENDERS: readonly Gender[] = ['male', 'female'];

const isValidAuthUser = (data: unknown): data is AuthUser => {
  if (!data || typeof data !== 'object') return false;
  const u = data as Record<string, unknown>;
  return (
    typeof u.id === 'number' &&
    typeof u.email === 'string' &&
    u.email.endsWith('@sangmyung.kr') &&
    typeof u.nickname === 'string' &&
    typeof u.mbti === 'string' &&
    typeof u.intro === 'string' &&
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
  const [user, setUser] = useState<AuthUser | null>(getStoredUser);

  const login = (authUser: AuthUser): void => {
    setUser(authUser);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));
  };

  const logout = (): void => {
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem(AUTH_USER_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: user !== null, login, logout }}>
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
