import Navbar from '@/components/navbar/Navbar';
import StoreProviders from '@/components/providers/StoreClientProviders';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <StoreProviders>
      <Navbar />
      <main className="pt-16">{children}</main>
    </StoreProviders>
  );
}
