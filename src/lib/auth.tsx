import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

interface AuthUser {
  id: string;
  email: string;
}

interface AuthSession {
  user: AuthUser;
}

interface AuthContextType {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'crossfit_audit_auth';

function readStoredUser(): { user: AuthUser; password: string } | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { user: AuthUser; password: string };
  } catch {
    return null;
  }
}

function writeStoredUser(user: AuthUser, password: string) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, password }));
}

function clearStoredUser() {
  localStorage.removeItem(STORAGE_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = readStoredUser();
    if (stored?.user) {
      setUser(stored.user);
      setSession({ user: stored.user });
    }
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string) => {
    const stored = readStoredUser();
    if (stored && stored.user.email !== email) {
      return { error: new Error('Un compte local existe déjà pour un autre email.') };
    }

    const newUser: AuthUser = {
      id: stored?.user.id || crypto.randomUUID(),
      email,
    };

    writeStoredUser(newUser, password);
    setUser(newUser);
    setSession({ user: newUser });

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const stored = readStoredUser();
    if (!stored) {
      return { error: new Error('Aucun compte local trouvé. Veuillez créer un compte.') };
    }
    if (stored.user.email !== email || stored.password !== password) {
      return { error: new Error('Identifiants invalides.') };
    }

    setUser(stored.user);
    setSession({ user: stored.user });
    return { error: null };
  };

  const signOut = async () => {
    clearStoredUser();
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
