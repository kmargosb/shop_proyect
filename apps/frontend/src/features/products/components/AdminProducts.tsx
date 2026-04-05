"use client";

import { Trash2, Pencil, Plus, Search } from "lucide-react";
import { useMemo, useEffect, useState } from "react";
import { apiFetch } from "@/shared/lib/api";
import EditProductModal from "./EditProductModal";
import CreateProductModal from "./CreateProductModal";
import { toast } from "sonner";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import type { Product } from "@/types/product";

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  /* ================= LOAD ================= */

  const loadProducts = async () => {
    try {
      const res = await apiFetch("/products");

      if (!res || !res.ok) return;

      const data = await res.json();
      setProducts(data);
    } catch {
      toast.error("Error cargando productos");
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  /* ================= DELETE ================= */

  const deleteProduct = async (id: string) => {
    try {
      const res = await apiFetch(`/products/${id}`, {
        method: "DELETE",
      });

      if (!res || !res.ok) throw new Error();

      toast.success("Producto eliminado");
      setProductToDelete(null);
      loadProducts();
    } catch {
      toast.error("Error eliminando producto");
    }
  };

  /* ================= FILTER ================= */

  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [products, search]);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-lg font-semibold">Productos</h2>

        <div className="flex gap-2 w-full md:w-auto">
          {/* SEARCH */}
          <div className="relative flex-1 md:w-64">
            <Search
              size={16}
              className="absolute left-3 top-3 text-neutral-500"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="w-full pl-8 pr-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm focus:outline-none"
            />
          </div>

          {/* BUTTON */}
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-sm cursor-pointer"
          >
            <Plus size={16} />
            Nuevo
          </button>
        </div>
      </div>

      {/* MOBILE VIEW */}
      <div className="md:hidden space-y-3">
        {filteredProducts.map((p) => {
          const img = p.images?.[0]; // 👈 compatible con tu type

          return (
            <div
              key={p.id}
              className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4"
            >
              <div className="flex gap-3 items-center">
                {img && (
                  <img
                    src={img.url}
                    className="w-12 h-12 rounded object-cover"
                  />
                )}

                <div className="flex-1">
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-neutral-500">
                    €{p.price} · Stock {p.stock}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 mt-3 text-sm">
                <button
                  onClick={() => setEditingProduct(p)}
                  className="text-blue-400"
                >
                  Editar
                </button>

                <button
                  onClick={() => setProductToDelete(p.id)}
                  className="text-red-400"
                >
                  Eliminar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block overflow-x-auto">
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="text-neutral-500">
              <tr>
                <th className="p-4 text-left">Imagen</th>
                <th className="p-4 text-left">Nombre</th>
                <th className="p-4 text-left">Precio</th>
                <th className="p-4 text-left">Stock</th>
                <th className="p-4 text-left">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((p) => {
                const img = p.images?.[0]; // 👈 fix clave

                return (
                  <tr key={p.id} className="border-t border-white/[0.08]">
                    <td className="p-4">
                      {img && (
                        <img
                          src={img.url}
                          className="w-10 h-10 rounded object-cover"
                        />
                      )}
                    </td>

                    <td className="p-4">{p.name}</td>
                    <td className="p-4">€{p.price}</td>
                    <td className="p-4">{p.stock}</td>

                    <td className="p-4 flex gap-3">
                      <button onClick={() => setEditingProduct(p)}>
                        <Pencil size={16} />
                      </button>

                      <button onClick={() => setProductToDelete(p.id)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALS */}
      {creating && (
        <CreateProductModal
          onClose={() => setCreating(false)}
          onCreated={loadProducts}
        />
      )}

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onUpdated={loadProducts}
        />
      )}

      {productToDelete && (
        <ConfirmDeleteModal
          title="Eliminar producto"
          description="Esta acción no se puede deshacer"
          onClose={() => setProductToDelete(null)}
          onConfirm={() => deleteProduct(productToDelete)}
        />
      )}
    </div>
  );
}
