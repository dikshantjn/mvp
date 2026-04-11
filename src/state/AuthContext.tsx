import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { AdminApiService } from '../api/admin';
import { ApiClient } from '../api/client';
import type { AdminLoginResponse, AdminUser, RefreshResponse } from '../types/api';
import { applyRefreshToStoredSession, readStoredSession, writeStoredSession } from './authStorage';

interface AuthContextValue {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  isBootstrapped: boolean;
  api: AdminApiService;
  login: (payload: AdminLoginResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState(() => readStoredSession());
  const [isBootstrapped, setIsBootstrapped] = useState(false);

  useEffect(() => {
    setIsBootstrapped(true);
  }, []);

  const api = useMemo(() => {
    const client = new ApiClient({
      getAccessToken: () => readStoredSession()?.accessToken ?? null,
      getRefreshToken: () => readStoredSession()?.refreshToken ?? null,
      setTokens: (tokens: RefreshResponse) => {
        const next = applyRefreshToStoredSession(tokens);
        writeStoredSession(next);
        setSession(next);
      },
      clear: () => {
        writeStoredSession(null);
        setSession(null);
      },
    });

    return new AdminApiService(client);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      admin: session?.admin ?? null,
      isAuthenticated: Boolean(session?.accessToken),
      isBootstrapped,
      api,
      login: (payload) => {
        const next = {
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken,
          expiresInSeconds: payload.expiresInSeconds,
          admin: payload.admin,
        };
        writeStoredSession(next);
        setSession(next);
      },
      logout: () => {
        writeStoredSession(null);
        setSession(null);
      },
    }),
    [api, isBootstrapped, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
