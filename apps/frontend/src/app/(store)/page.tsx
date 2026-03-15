import HeroCarousel from "@/components/store/HeroCarousel";
import ProductsPage from "@/features/products/ProductsPage";

export default function Home() {
  return (
    <main>
      <HeroCarousel />

      <div className="max-w-7xl mx-auto px-6 py-16">
        <ProductsPage />
      </div>
    </main>
  );
}
