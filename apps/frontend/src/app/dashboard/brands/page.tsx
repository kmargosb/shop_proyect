"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/shared/lib/api";

type Brand = {
  id: string;
  name: string;
  slug: string;
};

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  async function loadBrands() {
    const res = await apiFetch("/brands");

    if (!res) return;

    const data = await res.json();

    setBrands(data);
  }

  async function updateBrand(id: string) {
    if (!name.trim()) return;

    const res = await apiFetch(`/brands/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
      }),
    });

    if (!res?.ok) return;

    setName("");
    setEditingId(null);

    loadBrands();
  }

  async function deleteBrand(id: string) {
    const res = await apiFetch(`/brands/${id}`, {
      method: "DELETE",
    });

    if (!res?.ok) return;

    loadBrands();
  }

  async function createBrand() {
    if (!name.trim()) return;

    const res = await apiFetch("/brands", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
      }),
    });

    if (!res?.ok) return;

    setName("");
    loadBrands();
  }

  useEffect(() => {
    loadBrands();
  }, []);

  return (
    <div className="p-6 space-y-8 text-white">
      <div>
        <h1 className="text-3xl font-bold">Brands</h1>
      </div>

      <div className="flex gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nueva marca"
          className="dashboard-input max-w-sm"
        />

        <button
          onClick={() => (editingId ? updateBrand(editingId) : createBrand())}
          className="bg-white text-black px-4 rounded-xl"
        >
          {editingId ? "Guardar" : "Crear"}
        </button>
      </div>

      <div className="space-y-3">
        {brands.map((brand) => (
          <div key={brand.id} className="border border-white/10 rounded-xl p-4">
            <p className="font-semibold">{brand.name}</p>
            <div className="flex items-center justify-between mt-2">
              <p className="text-sm text-neutral-500">/brands/{brand.slug}</p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setEditingId(brand.id);
                    setName(brand.name);
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Editar
                </button>

                <button
                  onClick={() => deleteBrand(brand.id)}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
