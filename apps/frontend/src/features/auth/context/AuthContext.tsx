'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { fetchCurrentUser } from '../auth.service';

/* ================= TYPES ================= */

type User = {
  id: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER';
  name?: string | null;
  provider?: string | null;
  createdAt?: string;
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

type Props = {
  children: React.ReactNode;
  initialUser?: User | null;
};

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
