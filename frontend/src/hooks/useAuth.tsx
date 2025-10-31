import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { setAuthToken } from '../api/client';

type AuthState = {
  token: string | null;
  username: string | null;
};

type AuthContextValue = {
  token: string | null;
  username: string | null;
  login: (token: string, username: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = 'photo-exhibition-admin-token';

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, setState] = useState<AuthState>(() => {
    if (typeof window === 'undefined') {
      return { token: null, username: null };
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AuthState;
        setAuthToken(parsed.token);
        return parsed;
      } catch (error) {
        console.warn('Failed to parse auth token', error);
      }
    }
    return { token: null, username: null };
  });

  useEffect(() => {
    if (state.token) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setAuthToken(state.token);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      setAuthToken(null);
    }
  }, [state]);

  const value = useMemo<AuthContextValue>(() => ({
    token: state.token,
    username: state.username,
    login: (token: string, username: string) => setState({ token, username }),
    logout: () => setState({ token: null, username: null }),
  }), [state]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
