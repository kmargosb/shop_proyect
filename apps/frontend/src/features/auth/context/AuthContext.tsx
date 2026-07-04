'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useCurrentUser } from '../hooks/useCurrentUser';
import type { User, AuthContextType, Props } from '../types';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children, initialUser = null }: Props) {
  const hasInitialUser = initialUser !== null;

  const [user, setUser] = useState<User | null>(initialUser);

  const [loading, setLoading] = useState(!hasInitialUser);

  const { data: currentUser, isPending, refetch } = useCurrentUser(!hasInitialUser);

  const refreshUser = async () => {
    const { data } = await refetch();
    setUser(data ?? null);
  };

  useEffect(() => {
    if (hasInitialUser) {
      return;
    }

    if (currentUser !== undefined) {
      setUser(currentUser);
    }

    setLoading(isPending);
  }, [currentUser, hasInitialUser, isPending]);

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
