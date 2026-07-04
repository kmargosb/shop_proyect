'use client';

import { AuthProvider } from '@/features/auth/context/AuthContext';
import { LanguageProvider } from '@/shared/i18n/LanguageContext';
import StoreClientProviders from './StoreClientProviders';
import QueryProvider from './QueryProvider';

type User = {
  id: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER';
  name?: string | null;
} | null;

type Props = {
  children: React.ReactNode;
  initialUser: User;
};

export default function AppClientProviders({ children, initialUser }: Props) {
  return (
    <QueryProvider>
      <AuthProvider initialUser={initialUser}>
        <LanguageProvider>
          <StoreClientProviders>{children}</StoreClientProviders>
        </LanguageProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
