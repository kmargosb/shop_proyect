"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "@/shared/lib/api";

/* ================= TYPES ================= */

type User = {
  id: string;
  email: string;
  role: "ADMIN" | "CUSTOMER";
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  setUser: (user: User | null) => void;
  refreshUser: () => Promise<void>; // 🔥 NUEVO
};

/* ================= CONTEXT ================= */

const AuthContext = createContext<AuthContextType | null>(null);

/* ================= PROVIDER ================= */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD USER ================= */

  const loadUser = async () => {
    try {
      const res = await apiFetch("/auth/me");

      if (!res || !res.ok) {
        setUser(null);
        return;
      }

      const data = await res.json();
      setUser(data.user || null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /* ================= REFRESH USER (🔥 CLAVE) ================= */

  const refreshUser = async () => {
    try {
      const res = await apiFetch("/auth/me");

      if (!res || !res.ok) {
        setUser(null);
        return;
      }

      const data = await res.json();
      setUser(data.user || null);
    } catch {
      setUser(null);
    }
  };

  /* ================= INIT ================= */

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === "ADMIN",
        setUser,
        refreshUser, // 🔥 EXPORTADO
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ================= HOOK ================= */

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}