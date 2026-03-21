"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

interface Props {
  filters: any;
  setFilters: (f: any) => void;
}

const priceRanges = [
  { label: "All", value: null },
  { label: "0€ - 50€", min: 0, max: 50 },
  { label: "50€ - 100€", min: 50, max: 100 },
  { label: "100€ - 200€", min: 100, max: 200 },
  { label: "200€+", min: 200, max: null },
];

export default function ShopFilters({ filters, setFilters }: Props) {
  const [brands, setBrands] = useState<any[]>([]);

  useEffect(() => {
    const loadBrands = async () => {
      const res = await apiFetch("/brands");
      if (!res) return;

      const data = await res.json();
      setBrands(data);
    };

    loadBrands();
  }, []);

  return (
    <aside className="w-full md:w-64 space-y-10">
      {/* SEARCH */}
      <div>
        <h3 className="text-xs uppercase tracking-wider text-neutral-500 mb-3">
          Search
        </h3>

        <input
          placeholder="Search products..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="w-full bg-neutral-900 border border-neutral-700 px-3 py-2 rounded-md focus:outline-none focus:border-white"
        />
      </div>

      {/* BRANDS */}
      <div>
        <h3 className="text-xs uppercase tracking-wider text-neutral-500 mb-3">
          Brands
        </h3>

        <div className="space-y-2">
          {brands.map((brand) => (
            <label
              key={brand.id}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={filters.brand.includes(brand.slug)}
                onChange={() => {
                  const exists = filters.brand.includes(brand.slug);

                  setFilters({
                    ...filters,
                    brand: exists
                      ? filters.brand.filter((b: string) => b !== brand.slug)
                      : [...filters.brand, brand.slug],
                  });
                }}
                className="accent-white"
              />

              <span className="text-sm text-neutral-400 group-hover:text-white transition">
                {brand.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* PRICE */}
      <div>
        <h3 className="text-xs uppercase tracking-wider text-neutral-500 mb-3">
          Price
        </h3>

        <div className="space-y-2">
          {priceRanges.map((range, i) => (
            <label
              key={i}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <input
                type="radio"
                name="price"
                checked={
                  filters.minPrice == range.min && filters.maxPrice == range.max
                }
                onChange={() =>
                  setFilters({
                    ...filters,
                    minPrice: range.min ?? "",
                    maxPrice: range.max ?? "",
                  })
                }
                className="accent-white"
              />

              <span className="text-sm text-neutral-400 group-hover:text-white">
                {range.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* CLEAR */}
      <button
        onClick={() =>
          setFilters({
            search: "",
            brand: [],
            minPrice: "",
            maxPrice: "",
          })
        }
        className="text-sm text-neutral-500 hover:text-white transition"
      >
        Clear filters
      </button>
    </aside>
  );
}
