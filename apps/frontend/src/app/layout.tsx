import type { Metadata } from 'next';
import './globals.css';

import StoreProviders from '@/components/providers/StoreProviders';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { LanguageProvider } from '@/shared/i18n/LanguageContext';

import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Camarguette',
  description:
    'Contemporary clothing inspired by skateboarding, craftsmanship and timeless design.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <LanguageProvider>
            <Toaster
              richColors
              position="bottom-left"
              toastOptions={{
                duration: 3500,
              }}
            />
            <StoreProviders>{children}</StoreProviders>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
