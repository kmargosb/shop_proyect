import type { Metadata } from 'next';
import './globals.css';

import StoreProviders from '@/components/providers/StoreProviders';
import AppProviders from '@/components/providers/AppProviders';
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
        <AppProviders>
          <Toaster
            richColors
            position="bottom-left"
            toastOptions={{
              duration: 3500,
            }}
          />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
