"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { apiFetch } from "@/lib/api";
import { useNavbar } from "@/hooks/useNavbar";

import ProductCardSkeleton from "@/features/products/components/ProductCardSkeleton";
import ProductCard from "@/features/products/components/ProductCard";
import ShopFilters from "@/features/products/components/ShopFilters";
import ShopFilterBar from "@/features/products/components/ShopFilterBar";
import FilterDrawer from "@/features/products/components/FilterDrawer";

export default function ShopPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const navbarVisible = useNavbar((s) => s.visible);

  const [products, setProducts] = useState<any[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: "",
    brand: [] as string[],
    minPrice: "",
    maxPrice: "",
  });

  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [openMainFilters, setOpenMainFilters] = useState(false);

  const debouncedFilters = useDebounce(filters, 400);

  /* ===============================
     INIT FROM URL
  =============================== */

  useEffect(() => {
    const brand = searchParams.getAll("brand");

    setFilters({
      search: searchParams.get("search") || "",
      brand: brand || [],
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
    });

    setInitialized(true);
  }, []);

  /* ===============================
     SYNC URL (SIN LOOP)
  =============================== */

  useEffect(() => {
    if (!initialized) return;

    const params = new URLSearchParams();

    if (filters.search) params.set("search", filters.search);
    filters.brand.forEach((b) => params.append("brand", b));
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);

    const newUrl = `/shop?${params.toString()}`;
    const currentUrl = window.location.pathname + window.location.search;

    if (newUrl !== currentUrl) {
      router.replace(newUrl);
    }
  }, [filters, initialized, router]);

  /* ===============================
     FETCH PRODUCTS (SIN DOBLE)
  =============================== */

  useEffect(() => {
    if (!initialized) return;

    const fetchProducts = async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams();

        if (debouncedFilters.search)
          params.append("search", debouncedFilters.search);

        debouncedFilters.brand.forEach((b) => params.append("brand", b));

        if (debouncedFilters.minPrice)
          params.append("minPrice", debouncedFilters.minPrice);

        if (debouncedFilters.maxPrice)
          params.append("maxPrice", debouncedFilters.maxPrice);

        const res = await apiFetch(`/products/search?${params.toString()}`);

        if (!res || !res.ok) {
          setProducts([]);
          return;
        }

        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [debouncedFilters, initialized]);

  /* ===============================
     CONTENT
  =============================== */

  const content = useMemo(() => {
    if (loading) {
      return Array.from({ length: 9 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ));
    }

    return products.map((product) => (
      <motion.div
        key={product.id}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ProductCard product={product} />
      </motion.div>
    ));
  }, [loading, products]);

  /* ===============================
     UPDATE FILTER
  =============================== */

  const updateFilter = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  /* ===============================
     UI
  =============================== */

  return (
    <main className="max-w-7xl mx-auto px-6 pt-24 pb-16 text-white">
      <h1 className="text-3xl font-bold mb-6">Shop</h1>

      {/* 🔥 MOBILE FILTER BAR (DINÁMICO) */}
      <div
        className={`
          md:hidden sticky z-40 bg-white py-3 mb-6 border-neutral-800
          transition-all duration-300
          ${navbarVisible ? "top-16" : "top-0"}
        `}
      >
        <ShopFilterBar
          onOpenMainFilters={() => setOpenMainFilters(true)}
          onOpenFilter={(t) => setActiveFilter(t)}
        />
      </div>

      <div className="flex flex-col md:flex-row gap-10">
        {/* DESKTOP */}
        <div className="hidden md:block md:sticky md:top-24">
          <ShopFilters filters={filters} setFilters={setFilters} />
        </div>

        {/* PRODUCTS */}
        <div className="flex-1">
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {content}
          </motion.div>

          {!loading && products.length === 0 && (
            <p className="text-neutral-500 mt-10">No products found</p>
          )}
        </div>
      </div>

      {/* 🔥 FULL FILTERS */}
      <FilterDrawer
        open={openMainFilters}
        onClose={() => setOpenMainFilters(false)}
        title="Filtros"
        full
      >
        <ShopFilters filters={filters} setFilters={setFilters} />
      </FilterDrawer>

      {/* 🔥 INDIVIDUAL FILTERS */}
      <FilterDrawer
        open={!!activeFilter}
        onClose={() => setActiveFilter(null)}
        title={
          activeFilter === "brand"
            ? "Marca"
            : activeFilter === "price"
              ? "Precio"
              : activeFilter === "category"
                ? "Categoría"
                : ""
        }
      >
        {activeFilter === "brand" && (
          <label className="flex gap-2">
            <input
              type="checkbox"
              onChange={(e) =>
                updateFilter("brand", e.target.checked ? ["camarguette"] : [])
              }
            />
            Camarguette
          </label>
        )}

        {activeFilter === "price" && (
          <>
            <input
              placeholder="Min"
              className="border p-2 w-full"
              onChange={(e) => updateFilter("minPrice", e.target.value)}
            />
            <input
              placeholder="Max"
              className="border p-2 w-full"
              onChange={(e) => updateFilter("maxPrice", e.target.value)}
            />
          </>
        )}

        {activeFilter === "category" && (
          <>
            <label className="flex gap-2">
              <input type="checkbox" />
              Camisetas
            </label>
            <label className="flex gap-2">
              <input type="checkbox" />
              Sudaderas
            </label>
          </>
        )}
      </FilterDrawer>
    </main>
  );
}
