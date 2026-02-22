"use client"

import { useState } from "react"
import { apiFetch } from "@/lib/api"
import { toast } from "sonner"
import { Star } from "lucide-react"

type Image = {
  id: string
  url: string
  publicId: string
  isPrimary: boolean
}

type Product = {
  id: string
  name: string
  description?: string | null
  price: number
  stock: number
  images: Image[]
}

type Props = {
  product: Product
  onClose: () => void
  onUpdated: () => void
}

export default function EditProductModal({ product, onClose, onUpdated }: Props) {
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [images, setImages] = useState<Image[]>(product.images)
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([])
  const [primaryImageId, setPrimaryImageId] = useState<string | null>(
    product.images.find(img => img.isPrimary)?.id || null
  )

  const [form, setForm] = useState({
    name: product.name,
    description: product.description || "",
    price: product.price,
    stock: product.stock,
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const markImageForDeletion = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id))
    setImagesToDelete(prev => [...prev, id])

    if (primaryImageId === id) {
      setPrimaryImageId(null)
    }
  }

  const updateProduct = async () => {
  try {
    setLoading(true)

    const formData = new FormData()
    formData.append("name", form.name)
    formData.append("description", form.description)
    formData.append("price", String(form.price))
    formData.append("stock", String(form.stock))
    formData.append("imagesToDelete", JSON.stringify(imagesToDelete))
    formData.append("primaryImageId", primaryImageId || "")

    files.forEach(file => {
      formData.append("images", file)
    })

    const res = await apiFetch(`/products/${product.id}`, {
      method: "PUT",
      body: formData,
    })

    if (!res || !res.ok) throw new Error()

    toast.success("Producto actualizado correctamente")
    onUpdated()
    onClose()
  } catch {
    toast.error("Error actualizando producto")
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-2xl w-full max-w-lg space-y-4">

        <h2 className="text-xl font-semibold">Editar Producto</h2>

        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full p-2 bg-gray-800 rounded"
        />

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="w-full p-2 bg-gray-800 rounded"
        />

        <div className="flex gap-4">
          <input
            name="price"
            value={form.price}
            onChange={handleChange}
            className="flex-1 p-2 bg-gray-800 rounded"
          />
          <input
            name="stock"
            value={form.stock}
            onChange={handleChange}
            className="flex-1 p-2 bg-gray-800 rounded"
          />
        </div>

        {/* Existing Images */}
        {images.length > 0 && (
          <div className="flex gap-3 overflow-x-auto">
            {images.map(img => (
              <div key={img.id} className="relative">

                <img
                  src={img.url}
                  className="w-20 h-20 object-cover rounded-lg"
                />

                {/* Delete */}
                <button
                  onClick={() => markImageForDeletion(img.id)}
                  className="absolute -top-2 -right-2 bg-red-600 w-6 h-6 rounded-full text-xs flex items-center justify-center"
                >
                  ✕
                </button>

                {/* Primary Star */}
                <button
                  onClick={() => setPrimaryImageId(img.id)}
                  className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center
                  ${primaryImageId === img.id
                    ? "bg-yellow-500 text-black"
                    : "bg-gray-700 text-gray-400"
                  }`}
                >
                  <Star size={14} />
                </button>

              </div>
            ))}
          </div>
        )}

        {/* New Images */}
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => {
            if (!e.target.files) return
            setFiles(Array.from(e.target.files))
          }}
          className="w-full p-2 bg-gray-800 rounded"
        />

        {files.length > 0 && (
          <div className="flex gap-3 overflow-x-auto">
            {files.map((file, index) => (
              <img
                key={index}
                src={URL.createObjectURL(file)}
                className="w-20 h-20 object-cover rounded-lg"
              />
            ))}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 rounded"
          >
            Cancelar
          </button>

          <button
            onClick={updateProduct}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 rounded disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  )
}