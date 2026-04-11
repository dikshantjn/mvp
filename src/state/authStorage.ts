import type { AdminUser, RefreshResponse } from '../types/api';

export interface StoredSession {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
  admin: AdminUser | null;
}

const SESSION_KEY = 'unitary-care-admin-session';

export function readStoredSession(): StoredSession | null {
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    window.localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function writeStoredSession(session: StoredSession | null) {
  if (!session) {
    window.localStorage.removeItem(SESSION_KEY);
    return;
  }

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function applyRefreshToStoredSession(tokens: RefreshResponse): StoredSession | null {
  const current = readStoredSession();
  if (!current) {
    return null;
  }

  return {
    ...current,
    ...tokens,
  };
}
