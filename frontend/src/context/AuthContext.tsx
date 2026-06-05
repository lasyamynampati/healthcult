"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { apiFetch } from "@/lib/api";

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthCtx {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("hc_token");
    if (saved) {
      setToken(saved);
      apiFetch<User>("/api/v1/users/me")
        .then(setUser)
        .catch(() => {
          localStorage.removeItem("hc_token");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function login(email: string, password: string) {
    const data = await apiFetch<{ access_token: string }>(
      "/api/v1/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) }
    );
    localStorage.setItem("hc_token", data.access_token);
    setToken(data.access_token);
    const me = await apiFetch<User>("/api/v1/users/me");
    setUser(me);
  }

  async function register(email: string, password: string, role: string) {
    const data = await apiFetch<{ access_token: string }>(
      "/api/v1/auth/register",
      { method: "POST", body: JSON.stringify({ email, password, role }) }
    );
    localStorage.setItem("hc_token", data.access_token);
    setToken(data.access_token);
    const me = await apiFetch<User>("/api/v1/users/me");
    setUser(me);
  }

  function logout() {
    localStorage.removeItem("hc_token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
