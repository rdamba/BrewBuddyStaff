import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import * as authService from "../services/authService";
import type { AuthStatus, LoginCredentials, User } from "../types/auth";

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  token: string | null;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("checking");
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // On launch: try to restore a saved session.
  useEffect(() => {
    let cancelled = false;

    authService.restoreSession().then((session) => {
      if (cancelled) return;

      if (session) {
        setUser(session.user);
        setToken(session.token);
        setStatus("signedIn");
      } else {
        setStatus("signedOut");
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (credentials: LoginCredentials) => {
    const session = await authService.login(credentials);
    // may throw
    setUser(session.user);
    setToken(session.token);
    setStatus("signedIn");
  }, []);

  const signOut = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setToken(null);
    setStatus("signedOut");
  }, []);

  const value = useMemo(
    () => ({ status, user, token, signIn, signOut }),
    [status, user, token, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }

  return context;
}
