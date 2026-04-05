// src/hooks/useAuth.ts
"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/shared/lib/api";

type User = {
  id: string;
  email: string;
  role: "ADMIN" | "CUSTOMER";
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    const res = await apiFetch("/auth/me");

    if (!res) {
      setUser(null);
      setLoading(false);
      return;
    }

    const data = await res.json();

    setUser(data.user || null);
    setLoading(false);
  };

  useEffect(() => {
    fetchMe();
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "ADMIN",
    refetch: fetchMe,
  };
}