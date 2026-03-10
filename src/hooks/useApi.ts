import { useState, useEffect, useCallback, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiState<T> {
  data:     T | null;
  loading:  boolean;
  error:    string | null;
  refetch:  () => void;
}

interface FetchOptions extends RequestInit {
  skip?: boolean;
}

// ─── Utilitaire fetch authentifié ─────────────────────────────────────────────

export async function apiFetch<T = unknown>(
  url:     string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  if (res.status === 401) {
    // Redirige vers login si session expirée
    window.location.href = "/login";
    throw new Error("Session expirée");
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message ?? data.error ?? `Erreur ${res.status}`);
  }

  return data as T;
}

// ─── Hook useApi ──────────────────────────────────────────────────────────────

export function useApi<T>(
  url: string,
  options: FetchOptions = {}
): ApiState<T> {
  const [data,    setData]    = useState<T | null>(null);
  const [loading, setLoading] = useState(!options.skip);
  const [error,   setError]   = useState<string | null>(null);
  const [tick,    setTick]    = useState(0);

  // On mémorise les options pour éviter les re-renders infinis
  const optsRef = useRef(options);
  optsRef.current = options;

  const fetchData = useCallback(async () => {
    if (optsRef.current.skip) return;
    setLoading(true);
    setError(null);
    try {
      const result = await apiFetch<T>(url, optsRef.current);
      setData(result);
    } catch (err: any) {
      setError(err.message ?? "Erreur réseau");
    } finally {
      setLoading(false);
    }
  }, [url, tick]); // tick force le refetch

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => setTick(t => t + 1), []);

  return { data, loading, error, refetch };
}

// ─── Helpers mutations ────────────────────────────────────────────────────────

export function useApiMutation<TBody = unknown, TResult = unknown>() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const mutate = useCallback(async (
    url:    string,
    method: "POST" | "PUT" | "PATCH" | "DELETE",
    body?:  TBody
  ): Promise<TResult> => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFetch<TResult>(url, {
        method,
        body: body ? JSON.stringify(body) : undefined,
      });
      return result;
    } catch (err: any) {
      setError(err.message ?? "Erreur réseau");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}
