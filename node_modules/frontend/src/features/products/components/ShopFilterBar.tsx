"use client";

import { SlidersHorizontal } from "lucide-react";

type Props = {
  onOpenMainFilters: () => void;
  onOpenFilter: (type: string) => void;
};

export default function ShopFilterBar({
  onOpenMainFilters,
  onOpenFilter,
}: Props) {
  return (
    <div className="flex gap-3 justify-center pb-2 scrollbar-hide">
      {/* TODOS */}
      <button
        onClick={onOpenMainFilters}
        className="flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-700 bg-neutral-900 text-white whitespace-nowrap"
      >
        <SlidersHorizontal size={16} />
        Filtros
      </button>

      {/* BRAND */}
      <button
        onClick={() => onOpenFilter("brand")}
        className="px-4 py-2 rounded-full border border-neutral-700 bg-neutral-900 text-white whitespace-nowrap"
      >
        Marca
      </button>

      {/* PRECIO */}
      <button
        onClick={() => onOpenFilter("price")}
        className="px-4 py-2 rounded-full border border-neutral-700 bg-neutral-900 text-white whitespace-nowrap"
      >
        Precio
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
