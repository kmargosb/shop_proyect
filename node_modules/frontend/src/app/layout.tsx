import "./globals.css";
import StoreProviders from "@/components/providers/StoreProviders";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <StoreProviders>
          {children}
        </StoreProviders>
      </body>
    </html>
  );
}