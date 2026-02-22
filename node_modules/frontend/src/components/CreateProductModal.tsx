"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api"
import { toast } from "sonner";

type Props = {
  onClose: () => void;
  onCreated: () => void;
};

export default function CreateProductModal({ onClose, onCreated }: Props) {
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const createProduct = async () => {
  try {
    setLoading(true)

    const formData = new FormData()
    formData.append("name", form.name)
    formData.append("description", form.description)
    formData.append("price", form.price)
    formData.append("stock", form.stock)

    files.forEach((file) => {
      formData.append("images", file)
    })

    const res = await apiFetch("/products", {
      method: "POST",
      body: formData,
    })

    if (!res || !res.ok) throw new Error()

    toast.success("Producto creado correctamente")
    onCreated()
    onClose()
  } catch {
    toast.error("Error creando producto")
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-2xl w-full max-w-lg space-y-4">
        <h2 className="text-xl font-semibold">Nuevo Producto</h2>

        <input
          name="name"
          placeholder="Nombre"
          value={form.name}
          onChange={handleChange}
          className="w-full p-2 bg-gray-800 rounded"
        />

        <textarea
          name="description"
          placeholder="Descripción"
          value={form.description}
          onChange={handleChange}
          className="w-full p-2 bg-gray-800 rounded"
        />

        <div className="flex gap-4">
          <input
            name="price"
            placeholder="Precio"
            value={form.price}
            onChange={handleChange}
            className="flex-1 p-2 bg-gray-800 rounded"
          />
          <input
            name="stock"
            placeholder="Stock"
            value={form.stock}
            onChange={handleChange}
            className="flex-1 p-2 bg-gray-800 rounded"
          />
        </div>

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => {
            if (!e.target.files) return;

            const selectedFiles = Array.from(e.target.files);

            // 🔥 FORZAMOS ORDEN IZQUIERDA → DERECHA
            setFiles((prev) => [...prev, ...selectedFiles.reverse()]);
          }}
          className="w-full p-2 bg-gray-800 rounded"
        />

        {files.length > 0 && (
          <div className="flex gap-3 overflow-x-auto">
            {files.map((file, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(file)}
                  className="w-20 h-20 object-cover rounded-lg"
                />

                <button
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 bg-red-600 w-6 h-6 rounded-full text-xs flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-700 rounded">
            Cancelar
          </button>

          <button
            onClick={createProduct}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 rounded disabled:opacity-50"
          >
            {loading ? "Creando..." : "Crear"}
          </button>
        </div>
      </div>
    </div>
  );
}
