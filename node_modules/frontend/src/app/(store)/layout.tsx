import Navbar from "@/components/store/Navbar";
import StoreProviders from "@/components/providers/StoreProviders";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StoreProviders>
      <Navbar />

      <main className="pt-16">
        {children}
      </main>
    </StoreProviders>
  );
}