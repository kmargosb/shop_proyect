"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import type { ProductBrand } from "@/types/product";
import { ImagePlus, Loader2, PackagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/shared/lib/api";

type Props = {
  onClose: () => void;
  onCreated: () => void;
};

type ProductForm = {
  name: string;
  description: string;
  price: string;
  stock: string;
  brandId: string;
};

const emptyForm: ProductForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  brandId: "",
};

export default function CreateProductModal({ onClose, onCreated }: Props) {
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [brands, setBrands] = useState<ProductBrand[]>([]);
  const [form, setForm] = useState<ProductForm>(emptyForm);

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

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChange = (
  event: React.ChangeEvent<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >,
) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const createProduct = async () => {
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

      files.forEach((file) => {
        formData.append("images", file);
      });

      const res = await apiFetch("/products", {
        method: "POST",
        body: formData,
      });

      if (!res || !res.ok) throw new Error("Create product failed");

      toast.success("Producto creado correctamente");
      onCreated();
      onClose();
    } catch {
      toast.error("Error creando producto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal="true">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-white/10 bg-neutral-950 shadow-2xl shadow-black/40 sm:rounded-3xl">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-white/10 bg-neutral-950/95 p-5 backdrop-blur sm:p-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
              <PackagePlus size={14} /> Nuevo producto
            </div>
            <h2 className="mt-3 text-xl font-semibold text-white">Crear producto</h2>
            <p className="mt-1 text-sm text-neutral-400">Añade información comercial, inventario e imágenes listas para publicar.</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-neutral-500 transition hover:bg-white/10 hover:text-white" aria-label="Cerrar modal">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <Field label="Nombre" required>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Ej. Sneakers edición limitada" className="dashboard-input" />
          </Field>

          <Field label="Descripción">
            <textarea name="description" value={form.description} onChange={handleChange} rows={4} placeholder="Describe beneficios, materiales y detalles relevantes..." className="dashboard-input resize-none" />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Precio en céntimos" required hint="Ej. 12999 = €129.99">
              <input name="price" type="number" min="0" value={form.price} onChange={handleChange} placeholder="12999" className="dashboard-input" />
            </Field>
            <Field label="Stock inicial" required>
              <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} placeholder="48" className="dashboard-input" />
            </Field>
          </div>

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

<div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.03] p-5">
  <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl bg-black/20 p-6 text-center transition hover:bg-white/[0.04]">
    <ImagePlus className="text-neutral-500" size={28} />
    <span className="mt-3 text-sm font-semibold text-white">
      Subir imágenes
    </span>
    <span className="mt-1 text-xs text-neutral-500">
      PNG, JPG o WebP. La primera imagen será portada.
    </span>

    <input
      type="file"
      multiple
      accept="image/*"
      className="sr-only"
      onChange={(event) =>
        setFiles((prev) => [
          ...prev,
          ...Array.from(event.target.files ?? []),
        ])
      }
    />
  </label>

  {previews.length > 0 && (
    <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
      {previews.map((preview, index) => (
        <div
          key={`${preview.name}-${index}`}
          className="group relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]"
        >
          <img
            src={preview.url}
            alt={preview.name}
            className="h-full w-full object-cover"
          />

          <button
            onClick={() => removeFile(index)}
            className="absolute right-2 top-2 rounded-full bg-black/70 p-1 text-white opacity-100 transition hover:bg-rose-500 sm:opacity-0 sm:group-hover:opacity-100"
            aria-label="Eliminar imagen"
          >
            <X size={14} />
          </button>

          {index === 0 && (
            <span className="absolute bottom-2 left-2 rounded-full bg-white px-2 py-1 text-[10px] font-bold text-black">
              Portada
            </span>
          )}
        </div>
      ))}
    </div>
  )}
</div>
        </div>

        <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-white/10 bg-neutral-950/95 p-5 backdrop-blur sm:flex-row sm:justify-end sm:p-6">
          <button onClick={onClose} disabled={loading} className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-neutral-300 transition hover:bg-white/10 disabled:opacity-60">Cancelar</button>
          <button onClick={createProduct} disabled={loading || !isValid} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60">
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Creando..." : "Crear producto"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="flex items-center gap-2 text-sm font-medium text-neutral-200">
        {label} {required && <span className="text-emerald-300">*</span>}
      </span>
      {children}
      {hint && <span className="block text-xs text-neutral-500">{hint}</span>}
    </label>
  );
}
