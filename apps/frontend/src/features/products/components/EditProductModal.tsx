"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import type { ProductBrand } from "@/types/product";
import { ImagePlus, Loader2, Save, Star, X } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/shared/lib/api";
import type { Product, ProductImage } from "@/types/product";

type Props = {
  product: Product;
  onClose: () => void;
  onUpdated: () => void;
};

type ProductForm = {
  name: string;
  description: string;
  price: string;
  stock: string;
  brandId: string;
  category: string;
};

const categories = [
  { value: "T_SHIRTS", label: "T-Shirts" },
  { value: "SHIRTS", label: "Shirts" },
  { value: "TANK_TOPS", label: "Tank Tops" },
  { value: "PANTS", label: "Pants" },
  { value: "SOCKS", label: "Socks" },
  { value: "CAPS", label: "Caps" },

  { value: "SKATE_DECKS", label: "Skate Decks" },
  { value: "TRUCKS", label: "Trucks" },
  { value: "BEARINGS", label: "Bearings" },
  { value: "WHEELS", label: "Wheels" },
  { value: "HARDWARE", label: "Hardware" },
  { value: "WAX", label: "Wax" },

  { value: "STICKERS", label: "Stickers" },
  { value: "SPECIAL_ITEMS", label: "Special Items" },
  { value: "OTHER", label: "Other" },
];

export default function EditProductModal({ product, onClose, onUpdated }: Props) {
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [brands, setBrands] = useState<ProductBrand[]>([]);
  const [images, setImages] = useState<ProductImage[]>(product.images ?? []);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [primaryImageId, setPrimaryImageId] = useState<string | null>(
    product.images?.find((img) => img.isPrimary)?.id ?? product.images?.[0]?.id ?? null,
  );
  const [form, setForm] = useState<ProductForm>({
    name: product.name,
    description: product.description ?? "",
    price: String(product.price),
    stock: String(product.stock),
    brandId: product.brandId ?? "",
    category: product.category ?? "OTHER",
  });

  useEffect(() => {
  async function loadBrands() {
    try {
      const res = await apiFetch("/brands");

      if (!res) return;

      const data = await res.json();

      setBrands(data);
    } catch (err) {
      console.error(err);
    }
  }

  loadBrands();
}, []);

  const previews = useMemo(
    () => files.map((file) => ({ name: file.name, url: URL.createObjectURL(file) })),
    [files],
  );

  const isValid = form.name.trim() && Number(form.price) >= 0 && Number(form.stock) >= 0;

  const handleChange = (
  event: React.ChangeEvent<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >,
) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const markImageForDeletion = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    setImagesToDelete((prev) => (prev.includes(id) ? prev : [...prev, id]));

    if (primaryImageId === id) {
      setPrimaryImageId(null);
    }
  };

  const updateProduct = async () => {
    if (!isValid) {
      toast.error("Completa nombre, precio y stock con valores válidos");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("description", form.description.trim());
      formData.append("price", String(Math.round(Number(form.price))));
      formData.append("stock", String(Math.max(0, Math.round(Number(form.stock)))));
      formData.append("brandId", form.brandId);
      formData.append("category", form.category);
      formData.append("imagesToDelete", JSON.stringify(imagesToDelete));
      formData.append("primaryImageId", primaryImageId ?? "");

      files.forEach((file) => formData.append("images", file));

      const res = await apiFetch(`/products/${product.id}`, {
        method: "PUT",
        body: formData,
      });

      if (!res || !res.ok) throw new Error("Update product failed");

      toast.success("Producto actualizado correctamente");
      onUpdated();
      onClose();
    } catch {
      toast.error("Error actualizando producto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal="true">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-white/10 bg-neutral-950 shadow-2xl shadow-black/40 sm:rounded-3xl">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-white/10 bg-neutral-950/95 p-5 backdrop-blur sm:p-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-semibold text-sky-200">
              <Save size={14} /> Edición rápida
            </div>
            <h2 className="mt-3 text-xl font-semibold text-white">Editar producto</h2>
            <p className="mt-1 text-sm text-neutral-400">Actualiza catálogo, inventario y portada sin salir del dashboard.</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-neutral-500 transition hover:bg-white/10 hover:text-white" aria-label="Cerrar modal">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <Field label="Nombre" required>
            <input name="name" value={form.name} onChange={handleChange} className="dashboard-input" />
          </Field>

          <Field label="Descripción">
            <textarea name="description" value={form.description} onChange={handleChange} rows={4} className="dashboard-input resize-none" />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Precio en céntimos" required>
              <input name="price" type="number" min="0" value={form.price} onChange={handleChange} className="dashboard-input" />
            </Field>
            <Field label="Stock disponible" required>
              <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} className="dashboard-input" />
            </Field>
          </div>
<Field label="Categoría">
  <select
    name="category"
    value={form.category}
    onChange={handleChange}
    className="dashboard-input"
  >
    {categories.map((category) => (
      <option
        key={category.value}
        value={category.value}
      >
        {category.label}
      </option>
    ))}
  </select>
</Field>

<Field label="Marca">
  <select
    name="brandId"
    value={form.brandId}
    onChange={handleChange}
    className="dashboard-input"
  >
    <option value="">Sin marca</option>

    {brands.map((brand) => (
      <option key={brand.id} value={brand.id}>
        {brand.name}
      </option>
    ))}
  </select>
</Field>

<div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">Galería</h3>
                <p className="mt-1 text-xs text-neutral-500">Marca una imagen como portada o elimina las que ya no uses.</p>
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10">
                <ImagePlus size={14} /> Añadir
                <input type="file" multiple accept="image/*" className="sr-only" onChange={(event) => setFiles((prev) => [...prev, ...Array.from(event.target.files ?? [])])} />
              </label>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
              {images.map((img) => (
                <div key={img.id} className="group relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
                  <img src={img.url} alt={product.name} className="h-full w-full object-cover" />
                  <button onClick={() => setPrimaryImageId(img.id)} className={`absolute bottom-2 left-2 rounded-full p-1.5 transition ${primaryImageId === img.id ? "bg-yellow-400 text-black" : "bg-black/70 text-white hover:bg-yellow-400 hover:text-black"}`} aria-label="Marcar como portada">
                    <Star size={14} fill={primaryImageId === img.id ? "currentColor" : "none"} />
                  </button>
                  <button onClick={() => markImageForDeletion(img.id)} className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-white transition hover:bg-rose-500" aria-label="Eliminar imagen">
                    <X size={14} />
                  </button>
                </div>
              ))}

              {previews.map((preview, index) => (
                <div key={`${preview.name}-${index}`} className="relative aspect-square overflow-hidden rounded-2xl border border-emerald-400/20 bg-emerald-400/10">
                  <img src={preview.url} alt={preview.name} className="h-full w-full object-cover" />
                  <span className="absolute bottom-2 left-2 rounded-full bg-emerald-300 px-2 py-1 text-[10px] font-bold text-black">Nueva</span>
                  <button onClick={() => setFiles((prev) => prev.filter((_, i) => i !== index))} className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-white transition hover:bg-rose-500" aria-label="Eliminar imagen nueva">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-white/10 bg-neutral-950/95 p-5 backdrop-blur sm:flex-row sm:justify-end sm:p-6">
          <button onClick={onClose} disabled={loading} className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-neutral-300 transition hover:bg-white/10 disabled:opacity-60">Cancelar</button>
          <button onClick={updateProduct} disabled={loading || !isValid} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60">
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="flex items-center gap-2 text-sm font-medium text-neutral-200">
        {label} {required && <span className="text-emerald-300">*</span>}
      </span>
      {children}
    </label>
  );
}
