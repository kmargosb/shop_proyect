import HeroCarousel from "@/components/store/HeroCarousel";
import ProductsView from "@/features/products/components/ProductsView";
import FeaturedBrands from "@/components/store/FeaturedBrands";
import HomeCTA from "@/components/store/HomeCTA";
import Footer from "@/components/store/Footer";

export default function Home() {
  return (
    <main>
      {/* HERO */}
      <HeroCarousel />

      {/* FEATURED BRANDS */}
      <FeaturedBrands />

      {/* PRODUCTS */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <ProductsView />
      </div>

      {/* CTA */}
      <HomeCTA />

      {/* FOOTER */}
      <Footer />
    </main>
  );
}