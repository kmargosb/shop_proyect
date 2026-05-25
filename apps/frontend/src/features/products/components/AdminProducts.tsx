"use client";

import type { ReactNode } from "react";
import {
  Archive,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  PackageSearch,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/shared/lib/api";
import CreateProductModal from "./CreateProductModal";
import EditProductModal from "./EditProductModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import type { Product } from "@/types/product";

type ProductStatus = "active" | "draft" | "out-of-stock";
type SortKey = "createdAt" | "stock" | "sales" | "price" | "status";
type SortDirection = "asc" | "desc";
type StockFilter = "all" | "in-stock" | "low" | "out";

const PAGE_SIZE = 8;
const LOW_STOCK_LIMIT = 5;

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProductStatus | "all">(
    "all",
  );
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/products");
      if (!res || !res.ok) throw new Error("Products request failed");
      const data: unknown = await res.json();
      setProducts(Array.isArray(data) ? data.filter(isProductLike) : []);
    } catch {
      toast.error("Error cargando productos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, stockFilter, sortKey, sortDirection]);

  const deleteProduct = async (id: string) => {
    try {
      const res = await apiFetch(`/products/${id}`, { method: "DELETE" });
      if (!res || !res.ok) throw new Error("Delete product failed");
      toast.success("Producto archivado");
      setProductToDelete(null);
      loadProducts();
    } catch {
      toast.error("Error eliminando producto");
    }
  };

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products
      .filter((product) => {
        const status = getProductStatus(product);
        const searchable =
          `${product.name} ${product.description ?? ""} ${product.brand?.name ?? ""}`.toLowerCase();
        const stock = getProductStock(product);

        if (query && !searchable.includes(query)) return false;
        if (statusFilter !== "all" && status !== statusFilter) return false;
        if (stockFilter === "in-stock" && stock <= LOW_STOCK_LIMIT)
          return false;
        if (stockFilter === "low" && (stock <= 0 || stock > LOW_STOCK_LIMIT))
          return false;
        if (stockFilter === "out" && stock !== 0) return false;
        return true;
      })
      .sort((a, b) => compareProducts(a, b, sortKey, sortDirection));
  }, [products, search, statusFilter, stockFilter, sortKey, sortDirection]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PAGE_SIZE),
  );
  const paginatedProducts = filteredProducts.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );
  const stats = useMemo(() => buildProductStats(products), [products]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDirection(key === "createdAt" ? "desc" : "asc");
  };

  if (loading) return <ProductsSkeleton />;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_32%),linear-gradient(135deg,#111111,#070707)] p-5 shadow-2xl shadow-black/30 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
              Catálogo
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-4xl">
              Productos
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400 sm:text-base">
              Gestiona inventario, precios, visibilidad y acciones rápidas con
              una experiencia preparada para catálogos grandes.
            </p>
          </div>
          <button
            onClick={() => setCreating(true)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-neutral-200 sm:w-fit"
          >
            <Plus size={16} /> Nuevo producto
          </button>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <ProductStat
          label="SKUs activos"
          value={stats.active}
          helper={`${stats.total} productos visibles`}
          tone="emerald"
        />
        <ProductStat
          label="Stock bajo"
          value={stats.lowStock}
          helper={`≤ ${LOW_STOCK_LIMIT} unidades`}
          tone="amber"
        />
        <ProductStat
          label="Sin stock"
          value={stats.outOfStock}
          helper="Requieren reposición"
          tone="rose"
        />
        <ProductStat
          label="Valor inventario"
          value={formatMoney(stats.inventoryValue)}
          helper="Precio × stock"
          tone="sky"
        />
      </div>

      <section className="rounded-3xl border border-white/10 bg-neutral-950/80 p-4 shadow-xl shadow-black/20 sm:p-5">
        <div className="grid gap-3">
          {/* SEARCH */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre, marca o descripción..."
              className="dashboard-input pl-11"
            />
          </div>

          {/* FILTERS */}
          <div className="grid gap-3 sm:grid-cols-3">
            <FilterSelect
              label="Estado"
              value={statusFilter}
              onChange={(value) =>
                setStatusFilter(value as ProductStatus | "all")
              }
              options={[
                ["all", "Todos"],
                ["active", "Activos"],
                ["draft", "Draft"],
                ["out-of-stock", "Sin stock"],
              ]}
            />

            <FilterSelect
              label="Stock"
              value={stockFilter}
              onChange={(value) => setStockFilter(value as StockFilter)}
              options={[
                ["all", "Todo stock"],
                ["in-stock", "Saludable"],
                ["low", "Bajo"],
                ["out", "Agotado"],
              ]}
            />

            <div className="dashboard-input flex min-w-0 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] text-xs font-medium text-neutral-400">
              <SlidersHorizontal size={14} />
              <span className="truncate">Bulk actions preparado</span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-2 xl:hidden">
        {paginatedProducts.map((product) => (
          <ProductMobileCard
            key={product.id}
            product={product}
            onEdit={setEditingProduct}
            onDelete={setProductToDelete}
          />
        ))}
      </div>

      <section className="hidden overflow-hidden rounded-3xl border border-white/10 bg-neutral-950/80 shadow-xl shadow-black/20 xl:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-white/[0.03] text-xs uppercase tracking-[0.16em] text-neutral-500">
              <tr>
                <th className="p-4 text-left font-medium">Producto</th>
                <SortableTh
                  label="Precio"
                  active={sortKey === "price"}
                  onClick={() => handleSort("price")}
                />
                <SortableTh
                  label="Stock"
                  active={sortKey === "stock"}
                  onClick={() => handleSort("stock")}
                />
                <SortableTh
                  label="Ventas"
                  active={sortKey === "sales"}
                  onClick={() => handleSort("sales")}
                />
                <SortableTh
                  label="Estado"
                  active={sortKey === "status"}
                  onClick={() => handleSort("status")}
                />
                <SortableTh
                  label="Fecha"
                  active={sortKey === "createdAt"}
                  onClick={() => handleSort("createdAt")}
                />
                <th className="p-4 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((product) => (
                <tr
                  key={product.id}
                  className="border-t border-white/10 transition hover:bg-white/[0.04]"
                >
                  <td className="p-4">
                    <ProductIdentity product={product} />
                  </td>
                  <td className="p-4 font-semibold text-white">
                    {formatMoney(product.price)}
                  </td>
                  <td className="p-4">
                    <StockBadge stock={getProductStock(product)} />
                  </td>
                  <td className="p-4 text-neutral-300">{getSales(product)}</td>
                  <td className="p-4">
                    <StatusBadge status={getProductStatus(product)} />
                  </td>
                  <td className="p-4 text-neutral-400">
                    {formatDate(product.createdAt)}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <IconButton
                        label="Editar"
                        onClick={() => setEditingProduct(product)}
                      >
                        <Pencil size={15} />
                      </IconButton>
                      <IconButton
                        label="Archivar"
                        onClick={() => setProductToDelete(product)}
                        danger
                      >
                        <Trash2 size={15} />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {filteredProducts.length === 0 && (
        <EmptyProducts onCreate={() => setCreating(true)} />
      )}

      {filteredProducts.length > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={filteredProducts.length}
          onPage={setPage}
        />
      )}

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onUpdated={loadProducts}
        />
      )}
      {creating && (
        <CreateProductModal
          onClose={() => setCreating(false)}
          onCreated={loadProducts}
        />
      )}
      {productToDelete && (
        <ConfirmDeleteModal
          title="Archivar producto"
          description={`El producto “${productToDelete.name}” dejará de estar visible en la tienda. Podrás preparar una restauración futura desde acciones bulk.`}
          onClose={() => setProductToDelete(null)}
          onConfirm={() => deleteProduct(productToDelete.id)}
        />
      )}
    </div>
  );
}

function isProductLike(value: unknown): value is Product {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "name" in value
  );
}

function getSafeNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function getProductStock(product: Product) {
  return (
    product.variants?.reduce(
      (total, variant) =>
        total +
        (
          getSafeNumber(variant.stock) -
          getSafeNumber(
            variant.reservedStock,
          )
        ),
      0,
    ) ?? 0
  );
}

function getProductStatus(product: Product): ProductStatus {
  if (getProductStock(product) <= 0) return "out-of-stock";
  if (product.isActive === false) return "draft";
  return "active";
}

function getSales(product: Product) {
  return getSafeNumber(product.salesCount ?? product.totalSold);
}

function compareProducts(
  a: Product,
  b: Product,
  key: SortKey,
  direction: SortDirection,
) {
  const modifier = direction === "asc" ? 1 : -1;
  const values: Record<SortKey, [number, number]> = {
    createdAt: [
      new Date(a.createdAt).getTime() || 0,
      new Date(b.createdAt).getTime() || 0,
    ],
    stock: [getProductStock(a), getProductStock(b)],
    sales: [getSales(a), getSales(b)],
    price: [getSafeNumber(a.price), getSafeNumber(b.price)],
    status: [
      statusWeight(getProductStatus(a)),
      statusWeight(getProductStatus(b)),
    ],
  };
  const [left, right] = values[key];
  return (left - right) * modifier;
}

function statusWeight(status: ProductStatus) {
  return { active: 3, draft: 2, "out-of-stock": 1 }[status];
}

function buildProductStats(products: Product[]) {
  return products.reduce(
    (acc, product) => {
      const stock = getProductStock(product);
      acc.total += 1;
      acc.inventoryValue += getSafeNumber(product.price) * stock;
      if (getProductStatus(product) === "active") acc.active += 1;
      if (stock > 0 && stock <= LOW_STOCK_LIMIT) acc.lowStock += 1;
      if (stock <= 0) acc.outOfStock += 1;
      return acc;
    },
    { total: 0, active: 0, lowStock: 0, outOfStock: 0, inventoryValue: 0 },
  );
}

function getPrimaryImage(product: Product) {
  return (
    product.images?.find((image) => image.isPrimary) ?? product.images?.[0]
  );
}

function ProductIdentity({ product }: { product: Product }) {
  const image = getPrimaryImage(product);
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
        {image ? (
          <img
            src={image.url}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <Archive size={18} className="text-neutral-600" />
        )}
      </div>
      <div className="min-w-0 max-w-[220px]">
        <p className="truncate font-semibold text-white">{product.name}</p>
        <p className="truncate text-xs text-neutral-500">
          {product.brand?.name ?? product.description ?? "Sin descripción"}
        </p>
      </div>
    </div>
  );
}

function ProductMobileCard({
  product,
  onEdit,
  onDelete,
}: {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}) {
  return (
    <article className="rounded-3xl border border-white/10 bg-neutral-950/80 p-4 shadow-xl shadow-black/20">
      <div className="flex gap-3">
        <ProductIdentity product={product} />
        <StatusBadge status={getProductStatus(product)} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
        <Metric label="Precio" value={formatMoney(product.price)} />
        <Metric
          label="Stock"
          value={getProductStock(product)}
        />
        <Metric label="Ventas" value={getSales(product)} />
      </div>
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => onEdit(product)}
          className="flex-1 rounded-2xl bg-white px-3 py-2 text-sm font-semibold text-black"
        >
          Editar
        </button>
        <button
          onClick={() => onDelete(product)}
          className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm font-semibold text-rose-200"
        >
          Eliminar
        </button>
      </div>
    </article>
  );
}

function ProductStat({
  label,
  value,
  helper,
  tone,
}: {
  label: string;
  value: string | number;
  helper: string;
  tone: "emerald" | "amber" | "rose" | "sky";
}) {
  const tones = {
    emerald: "text-emerald-300",
    amber: "text-amber-300",
    rose: "text-rose-300",
    sky: "text-sky-300",
  };
  return (
    <div className="rounded-2xl border border-white/10 bg-neutral-950/80 p-3 shadow-xl shadow-black/20 sm:rounded-3xl sm:p-5">
      <p className="text-xs text-neutral-400 sm:text-sm">{label}</p>
      <p
        className={`mt-1 text-lg font-semibold sm:mt-2 sm:text-2xl ${tones[tone]}`}
      >
        {value}
      </p>
      <p className="mt-1 line-clamp-1 text-[11px] text-neutral-500 sm:text-xs">
        {helper}
      </p>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: [string, string][];
  onChange: (value: string) => void;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="dashboard-input w-full min-w-0"
    >
      {options.map(([optionValue, optionLabel]) => (
        <option
          key={optionValue}
          value={optionValue}
          className="bg-neutral-950"
        >
          {optionLabel}
        </option>
      ))}
    </select>
  );
}

function SortableTh({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <th className="p-4 text-left font-medium">
      <button
        onClick={onClick}
        className={`inline-flex items-center gap-2 transition hover:text-white ${active ? "text-white" : "text-neutral-500"}`}
      >
        {label}
        <ArrowUpDown size={13} />
      </button>
    </th>
  );
}

function StockBadge({ stock }: { stock: number }) {
  const safeStock = getSafeNumber(stock);
  const className =
    safeStock <= 0
      ? "border-rose-400/20 bg-rose-400/10 text-rose-200"
      : safeStock <= LOW_STOCK_LIMIT
        ? "border-amber-400/20 bg-amber-400/10 text-amber-200"
        : "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${className}`}
    >
      {safeStock <= 0 ? "Agotado" : `${safeStock} uds.`}
    </span>
  );
}

function StatusBadge({ status }: { status: ProductStatus }) {
  const config = {
    active: [
      "Activo",
      "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
    ],
    draft: [
      "Draft",
      "border-neutral-400/20 bg-neutral-400/10 text-neutral-200",
    ],
    "out-of-stock": [
      "Sin stock",
      "border-rose-400/20 bg-rose-400/10 text-rose-200",
    ],
  }[status];
  return (
    <span
      className={`ml-auto inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${config[1]}`}
    >
      {config[0]}
    </span>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-white/[0.05] p-3">
      <p className="text-neutral-500">{label}</p>
      <p className="mt-1 truncate font-semibold text-white">{value}</p>
    </div>
  );
}
function IconButton({
  label,
  children,
  onClick,
  danger,
}: {
  label: string;
  children: ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`rounded-xl border p-2 transition ${danger ? "border-rose-400/20 text-rose-300 hover:bg-rose-400/10" : "border-white/10 text-neutral-300 hover:bg-white/10 hover:text-white"}`}
    >
      {children}
    </button>
  );
}
function EmptyProducts({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
      <PackageSearch className="mx-auto text-neutral-600" size={34} />
      <p className="mt-4 font-semibold text-neutral-200">
        No hay productos para estos filtros
      </p>
      <p className="mt-2 text-sm text-neutral-500">
        Ajusta la búsqueda o crea un producto nuevo.
      </p>
      <button
        onClick={onCreate}
        className="mt-5 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black"
      >
        Crear producto
      </button>
    </div>
  );
}
function Pagination({
  page,
  totalPages,
  total,
  onPage,
}: {
  page: number;
  totalPages: number;
  total: number;
  onPage: (page: number) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-neutral-950/80 p-4 text-sm text-neutral-400 sm:flex-row sm:items-center sm:justify-between">
      <span>
        {total} resultados · Página {page} de {totalPages}
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => onPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="rounded-xl border border-white/10 p-2 disabled:opacity-40"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={() => onPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="rounded-xl border border-white/10 p-2 disabled:opacity-40"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
function ProductsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-44 animate-pulse rounded-3xl bg-white/[0.06]" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-3xl bg-white/[0.06]"
          />
        ))}
      </div>
      <div className="h-96 animate-pulse rounded-3xl bg-white/[0.06]" />
    </div>
  );
}
function formatMoney(cents: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(getSafeNumber(cents) / 100);
}
function formatDate(date: string) {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime())
    ? "—"
    : parsed.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}
