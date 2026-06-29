'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { fetchCurrentUser } from '../auth.service';
import type { User, AuthContextType, Props } from '../types';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children, initialUser = null }: Props) {
  const hasInitialUser = initialUser !== null;

  const [user, setUser] = useState<User | null>(initialUser);

  const [loading, setLoading] = useState(!hasInitialUser);

  const fetchUser = async () => {
    const user = await fetchCurrentUser();

    setUser(user);
  };

  const loadUser = async () => {
    try {
      await fetchUser();
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = fetchUser;

  useEffect(() => {
    if (!hasInitialUser) {
      loadUser();
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: user !== null,
        isAdmin: user?.role === 'ADMIN',
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
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
