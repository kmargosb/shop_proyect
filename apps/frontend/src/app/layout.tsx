import "./globals.css";
import StoreProviders from "@/components/providers/StoreProviders";
import { AuthProvider } from "@/features/auth/context/AuthContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <StoreProviders>
            {children}
          </StoreProviders>
        </AuthProvider>
      </body>
    </html>
  );
}