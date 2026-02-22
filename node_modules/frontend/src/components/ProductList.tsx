"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"

type Product = {
  id: string
  name: string
  price: number
  stock: number
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await apiFetch("/products", {
          method: "GET",
        })

        if (!res) return

        const data = await res.json()
        setProducts(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  if (loading) return <p className="text-white">Cargando productos...</p>

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {products.map(p => (
        <div key={p.id} className="bg-gray-800 p-4 rounded-xl shadow">
          <h2 className="text-xl font-bold">{p.name}</h2>
          <p>💰 Precio: ${p.price}</p>
          <p>📦 Stock: {p.stock}</p>
        </div>
      ))}
    </div>
  )
}