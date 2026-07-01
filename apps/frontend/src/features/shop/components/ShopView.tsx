'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavbar } from '@/hooks/useNavbar';
import { useQuery } from '@tanstack/react-query';
import type { Product } from '@/types/product';

import { productsApi } from '@/features/products/api/products.api'; // ✅ NEW

import ProductCardSkeleton from '@/features/products/components/ProductCardSkeleton';
import ProductCard from '@/features/products/components/ProductCard';
import ShopFilters from '@/features/products/components/ShopFilters';
import ShopFilterBar from '@/features/products/components/ShopFilterBar';
import FilterDrawer from '@/features/products/components/FilterDrawer';

export function ShopView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const navbarVisible = useNavbar((s) => s.visible);

  const [initialized, setInitialized] = useState(false);

  const [filters, setFilters] = useState({
    search: '',
    brand: [] as string[],
    minPrice: '',
    maxPrice: '',
  });

  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [openMainFilters, setOpenMainFilters] = useState(false);

  const debouncedFilters = useDebounce(filters, 400);

  useEffect(() => {
    const brand = searchParams.getAll('brand');

    setFilters({
      search: searchParams.get('search') || '',
      brand: brand || [],
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
    });

    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;

    const params = new URLSearchParams();

    if (filters.search) params.set('search', filters.search);
    filters.brand.forEach((b) => params.append('brand', b));
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);

    const newUrl = `/shop?${params.toString()}`;
    const currentUrl = window.location.pathname + window.location.search;

    if (newUrl !== currentUrl) {
      router.replace(newUrl);
    }
  }, [filters, initialized, router]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    if (debouncedFilters.search) params.append('search', debouncedFilters.search);

    debouncedFilters.brand.forEach((b) => params.append('brand', b));

    if (debouncedFilters.minPrice) params.append('minPrice', debouncedFilters.minPrice);

    if (debouncedFilters.maxPrice) params.append('maxPrice', debouncedFilters.maxPrice);

    return params.toString();
  }, [debouncedFilters]);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', queryString],
    queryFn: () => productsApi.search(queryString), // ✅ CLEAN
    enabled: initialized,
  });

  const content = useMemo(() => {
    if (isLoading) {
      return Array.from({ length: 9 }).map((_, i) => <ProductCardSkeleton key={i} />);
    }

    return products.map((product: Product) => (
      <motion.div
        key={product.id}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ProductCard product={product} />
      </motion.div>
    ));
  }, [isLoading, products]);

  const updateFilter = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const getFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.brand.length) count += filters.brand.length;
    if (filters.minPrice || filters.maxPrice) count++;
    return count;
  };

  const getBrandCount = () => filters.brand.length;
  const getPriceCount = () => (filters.minPrice || filters.maxPrice ? 1 : 0);

  return (
    <main className="mx-auto max-w-7xl px-6 pt-24 pb-16 text-white">
      <h1 className="mb-6 text-3xl font-bold">Shop</h1>

      <div
        className={`sticky z-40 mb-6 bg-white py-3 transition-all duration-300 md:hidden ${navbarVisible ? 'top-16' : 'top-0'} `}
      >
        <ShopFilterBar
          onOpenMainFilters={() => setOpenMainFilters(true)}
          onOpenFilter={(t) => setActiveFilter(t)}
          totalCount={getFilterCount()}
          brandCount={getBrandCount()}
          priceCount={getPriceCount()}
        />
      </div>

      <div className="flex flex-col gap-10 md:flex-row">
        <div className="hidden md:sticky md:top-24 md:block">
          <ShopFilters filters={filters} setFilters={setFilters} />
        </div>

        <div className="flex-1">
          <motion.div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
            {content}
          </motion.div>

          {!isLoading && products.length === 0 && (
            <p className="mt-10 text-neutral-500">No products found</p>
          )}
        </div>
      </div>

      <FilterDrawer
        open={openMainFilters}
        onClose={() => setOpenMainFilters(false)}
        title="Filtros"
        full
      >
        <ShopFilters filters={filters} setFilters={setFilters} />
      </FilterDrawer>

      <FilterDrawer
        open={!!activeFilter}
        onClose={() => setActiveFilter(null)}
        title={
          activeFilter === 'brand'
            ? 'Marca'
            : activeFilter === 'price'
              ? 'Precio'
              : activeFilter === 'category'
                ? 'Categoría'
                : ''
        }
      >
        {activeFilter === 'brand' && (
          <label className="flex gap-2">
            <input
              type="checkbox"
              onChange={(e) => updateFilter('brand', e.target.checked ? ['camarguette'] : [])}
            />
            Camarguette
          </label>
        )}

        {activeFilter === 'price' && (
          <>
            <input
              placeholder="Min"
              className="w-full border p-2"
              onChange={(e) => updateFilter('minPrice', e.target.value)}
            />
            <input
              placeholder="Max"
              className="w-full border p-2"
              onChange={(e) => updateFilter('maxPrice', e.target.value)}
            />
          </>
        )}

        {activeFilter === 'category' && (
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
