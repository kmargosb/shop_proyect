export type User = {
  id: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER';
  name?: string | null;
  provider?: string | null;
  createdAt?: string;
};

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  setUser: (user: User | null) => void;
  refreshUser: () => Promise<void>; // 🔥 NUEVO
};

export type Props = {
  children: React.ReactNode;
  initialUser?: User | null;
};
