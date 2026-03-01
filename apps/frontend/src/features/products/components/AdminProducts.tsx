"use client"

import { Trash2, Pencil, Plus, Search } from "lucide-react"
import { useMemo, useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import EditProductModal from "./EditProductModal"
import CreateProductModal from "./CreateProductModal"
import { toast } from "sonner"
import ConfirmDeleteModal from "./ConfirmDeleteModal"

type ProductImage = {
  id: string
  url: string
  publicId: string
  productId: string
  isPrimary: boolean
}

type Product = {
  id: string
  name: string
  description?: string | null
  price: number
  stock: number
  images: ProductImage[]
  createdAt: string
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState("")
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [creating, setCreating] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [serverDown, setServerDown] = useState(false)

  /* ============================
     LOAD PRODUCTS
  ============================ */

  const loadProducts = async () => {
    try {
      const res = await apiFetch("/products", { method: "GET" })

      if (!res || !res.ok) return

      const data = await res.json()

      setProducts(data)
      setServerDown(false)
    } catch (error) {
      console.error("Servidor no disponible")
      setServerDown(true)
      // 🔥 NO vaciamos productos
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  /* ============================
     DELETE PRODUCT
  ============================ */

  const deleteProduct = async (id: string) => {
    try {
      const res = await apiFetch(`/products/${id}`, {
        method: "DELETE",
      })

      if (!res || !res.ok) throw new Error()

      toast.success("Producto eliminado correctamente")
      setProductToDelete(null)
      loadProducts()
    } catch {
      toast.error("No se pudo eliminar el producto")
    }
  }

  /* ============================
     FILTER
  ============================ */

  const filteredProducts = useMemo(() => {
    return products.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase())
    )
  }, [products, search])

  return (
    <div className="space-y-10 animate-fade-in">

      {/* 🔥 SERVER DOWN BANNER */}
      {serverDown && (
        <div className="bg-red-600 text-white p-4 rounded-xl">
          ⚠️ Servidor no disponible. Algunas funciones están deshabilitadas.
        </div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            label: "Total productos",
            value: products.length,
          },
          {
            label: "Stock total",
            value: products.reduce((acc, p) => acc + p.stock, 0),
          },
          {
            label: "Valor inventario",
            value:
              "$" +
              products
                .reduce((acc, p) => acc + p.price * p.stock, 0)
                .toFixed(2),
          },
        ].map((card, i) => (
          <div
            key={i}
            className="bg-gray-900 p-6 rounded-2xl border border-gray-800 hover:border-blue-500 transition-all duration-300 hover:-translate-y-1"
          >
            <p className="text-sm text-gray-400">{card.label}</p>
            <p className="text-3xl font-bold mt-2">{card.value}</p>
          </div>
        ))}
      </div>

      {/* HEADER ACTIONS */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Productos</h2>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="pl-8 pr-3 py-2 bg-gray-900 border border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
            />
          </div>

          <button
            disabled={serverDown}
            onClick={() => setCreating(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
              serverDown
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500"
            }`}
          >
            <Plus size={16} />
            Nuevo
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-800 text-gray-400">
            <tr>
              <th className="p-4 text-left">Imagen</th>
              <th className="p-4 text-left">Nombre</th>
              <th className="p-4 text-left">Precio</th>
              <th className="p-4 text-left">Stock</th>
              <th className="p-4 text-left">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.map(p => {
              const primaryImage = p.images.find(img => img.isPrimary)

              return (
                <tr
                  key={p.id}
                  className="border-t border-gray-800 hover:bg-gray-800/40 transition"
                >
                  <td className="p-4">
                    {primaryImage ? (
                      <img
                        src={primaryImage.url}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-gray-500 text-sm">
                        Sin imagen
                      </span>
                    )}
                  </td>

                  <td className="p-4">{p.name}</td>
                  <td className="p-4">${p.price}</td>
                  <td className="p-4">{p.stock}</td>

                  <td className="p-4 flex gap-4">
                    <button
                      disabled={serverDown}
                      onClick={() => setEditingProduct(p)}
                      className={`transition ${
                        serverDown
                          ? "text-gray-500 cursor-not-allowed"
                          : "text-blue-400 hover:text-blue-300"
                      }`}
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      disabled={serverDown}
                      onClick={() => setProductToDelete(p.id)}
                      className={`transition ${
                        serverDown
                          ? "text-gray-500 cursor-not-allowed"
                          : "text-red-400 hover:text-red-300"
                      }`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
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
          description="¿Seguro que quieres eliminar este producto? Esta acción no se puede deshacer."
          onClose={() => setProductToDelete(null)}
          onConfirm={() => deleteProduct(productToDelete)}
        />
      )}
    </div>
  )
}