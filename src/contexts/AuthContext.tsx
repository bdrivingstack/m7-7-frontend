import {
  createContext, useContext, useEffect, useState, useCallback,
  type ReactNode,
} from "react";
import { API_BASE } from "@/hooks/useApi";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id:         string;
  email:      string;
  firstName:  string;
  lastName:   string;
  role:       "OWNER" | "ADMIN" | "MANAGER" | "ACCOUNTANT" | "VIEWER";
  orgId:      string;
  orgName:    string;
  legalForm?: string;
  plan?:      string;
  avatarUrl?: string;
}

interface AuthContextValue {
  user:      AuthUser | null;
  loading:   boolean;
  error:     string | null;
  logout:    () => Promise<void>;
  refresh:   () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const fetchMe = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (res.status === 401) {
        setUser(null);
        return;
      }

      if (!res.ok) {
        throw new Error(`Erreur serveur (${res.status})`);
      }

      const ct = res.headers.get("content-type");
      if (!ct?.includes("application/json")) {
        throw new Error("Serveur inaccessible");
      }

      const data = await res.json();
      setUser(data.user ?? data);
    } catch (err: any) {
      setError(err.message ?? "Erreur réseau");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setUser(null);
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return (
    <AuthContext.Provider value={{ user, loading, error, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
