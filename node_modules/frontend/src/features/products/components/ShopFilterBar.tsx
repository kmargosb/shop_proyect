"use client";

import { SlidersHorizontal } from "lucide-react";

type Props = {
  onOpenMainFilters: () => void;
  onOpenFilter: (type: string) => void;

  totalCount?: number;
  brandCount?: number;
  priceCount?: number;
};

export default function ShopFilterBar({
  onOpenMainFilters,
  onOpenFilter,
  totalCount = 0,
  brandCount = 0,
  priceCount = 0,
}: Props) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {/* ALL FILTERS */}
      <button
        onClick={onOpenMainFilters}
        className="flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-700 bg-neutral-900 text-white whitespace-nowrap"
      >
        <SlidersHorizontal size={16} />
        Filtros {totalCount > 0 && `(${totalCount})`}
      </button>

      {/* BRAND */}
      <button
        onClick={() => onOpenFilter("brand")}
        className="px-4 py-2 rounded-full border border-neutral-700 bg-neutral-900 text-white whitespace-nowrap"
      >
        Marca {brandCount > 0 && `(${brandCount})`}
      </button>

      {/* PRICE */}
      <button
        onClick={() => onOpenFilter("price")}
        className="px-4 py-2 rounded-full border border-neutral-700 bg-neutral-900 text-white whitespace-nowrap"
      >
        Precio {priceCount > 0 && `(${priceCount})`}
      </button>

      {/* CATEGORY */}
      <button
        onClick={() => onOpenFilter("category")}
        className="px-4 py-2 rounded-full border border-neutral-700 bg-neutral-900 text-white whitespace-nowrap"
      >
        Categoría
      </button>
    </div>
  );
}
