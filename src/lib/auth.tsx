import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

interface AuthSession {
  user: AuthUser;
  token: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'crossfit_audit_auth';
const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

function readStoredSession(): AuthSession | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

function writeStoredSession(session: AuthSession) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

function clearStoredSession() {
  localStorage.removeItem(STORAGE_KEY);
}

async function requestAuth(path: string, body: Record<string, unknown>) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = payload?.message || payload?.error || response.statusText;
    throw new Error(message);
  }

  return payload as { user: AuthUser; token: string };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = readStoredSession();
    if (stored?.user && stored.token) {
      setUser(stored.user);
      setSession(stored);
    }
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    if (!name.trim()) {
      return { error: new Error('Le nom est requis.') };
    }

    try {
      const payload = await requestAuth('/auth/register', { email, password, name });
      const newSession = { user: payload.user, token: payload.token };
      writeStoredSession(newSession);
      setUser(payload.user);
      setSession(newSession);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const payload = await requestAuth('/auth/login', { email, password });
      const newSession = { user: payload.user, token: payload.token };
      writeStoredSession(newSession);
      setUser(payload.user);
      setSession(newSession);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    clearStoredSession();
    setUser(null);
    setSession(null);
  };

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      signUp,
      signIn,
      signOut,
    }),
    [user, session, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
