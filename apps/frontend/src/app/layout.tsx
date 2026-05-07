import "./globals.css";
import StoreProviders from "@/components/providers/StoreProviders";
import { AuthProvider } from "@/features/auth/context/AuthContext";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Toaster
            richColors
            position="bottom-left"
            toastOptions={{
              duration: 3500,
            }}
          />
          <StoreProviders>{children}</StoreProviders>
        </AuthProvider>
      </body>
    </html>
  );
}
