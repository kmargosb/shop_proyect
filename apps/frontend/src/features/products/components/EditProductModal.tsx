'use client';

import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';

import { ImagePlus, Loader2, Plus, Save, Star, Trash2, X } from 'lucide-react';

import { toast } from 'sonner';

import { apiFetch } from '@/shared/lib/api';

import type { Product, ProductBrand, ProductImage } from '@/types/product';

const categories = [
  { value: 'T_SHIRTS', label: 'T-Shirts' },
  { value: 'SHIRTS', label: 'Shirts' },
  { value: 'TANK_TOPS', label: 'Tank Tops' },
  { value: 'PANTS', label: 'Pants' },
  { value: 'SOCKS', label: 'Socks' },
  { value: 'CAPS', label: 'Caps' },

  { value: 'SKATE_DECKS', label: 'Skate Decks' },
  { value: 'TRUCKS', label: 'Trucks' },
  { value: 'BEARINGS', label: 'Bearings' },
  { value: 'WHEELS', label: 'Wheels' },
  { value: 'HARDWARE', label: 'Hardware' },
  { value: 'WAX', label: 'Wax' },

  { value: 'STICKERS', label: 'Stickers' },
  {
    value: 'SPECIAL_ITEMS',
    label: 'Special Items',
  },

  { value: 'OTHER', label: 'Other' },
];

const genders = [
  {
    value: 'MEN',
    label: 'Men',
  },

  {
    value: 'WOMEN',
    label: 'Women',
  },

  {
    value: 'UNISEX',
    label: 'Unisex',
  },
];

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'ONE_SIZE'];

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'ONE_SIZE'];

const colors = ['BLACK', 'WHITE', 'BEIGE', 'GREY', 'GREEN', 'RED', 'BLUE', 'BROWN'];

type Props = {
  product: Product;
  onClose: () => void;
  onUpdated: () => void;
};

type VariantForm = {
  size: string;
  color: string;
  stock: string;
};

type ProductForm = {
  name: string;
  description: string;
  price: string;
  brandId: string;
  category: string;
  gender: string;

  variants: VariantForm[];
};

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

    description: product.description ?? '',

    price: String((product.price / 100).toFixed(2)),

    brandId: product.brandId ?? '',

    category: product.category ?? 'OTHER',

    gender: product.gender ?? 'UNISEX',

    variants:
      product.variants?.map((variant: any) => ({
        size: variant.size,
        color: variant.color,
        stock: String(variant.stock),
      })) ?? [],
  });

  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [variantColor, setVariantColor] = useState('BLACK');
  const [defaultStock, setDefaultStock] = useState(5);

  /* ===============================
     BODY LOCK
  =============================== */

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  /* ===============================
     LOAD BRANDS
  =============================== */

  useEffect(() => {
    async function loadBrands() {
      try {
        const res = await apiFetch('/brands');

        if (!res) return;

        const data = await res.json();

        setBrands(data);
      } catch (err) {
        console.error(err);
      }
    }

    loadBrands();
  }, []);

  /* ===============================
     PREVIEWS
  =============================== */

  const previews = useMemo(
    () =>
      files.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
      })),
    [files],
  );

  /* ===============================
     VALIDATION
  =============================== */

  const isValid = form.name.trim() && Number(form.price) >= 0 && form.variants.length > 0;

  /* ===============================
     HANDLERS
  =============================== */

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setForm((prev) => ({
      ...prev,

      [event.target.name]: event.target.value,
    }));
  };

  const updateVariant = (index: number, field: string, value: string) => {
    setForm((prev) => ({
      ...prev,

      variants: prev.variants.map((variant, i) =>
        i === index
          ? {
              ...variant,
              [field]: value,
            }
          : variant,
      ),
    }));
  };

  const removeVariant = (index: number) => {
    setForm((prev) => ({
      ...prev,

      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    );
  };

  const generateVariants = () => {
    setForm((prev) => {
      const existing = [...prev.variants];

      selectedSizes.forEach((size) => {
        const alreadyExists = existing.some(
          (variant) => variant.size === size && variant.color === variantColor,
        );

        if (!alreadyExists) {
          existing.push({
            size,
            color: variantColor,
            stock: String(defaultStock),
          });
        }
      });

      return {
        ...prev,
        variants: existing,
      };
    });

    setSelectedSizes([]);
  };

  const markImageForDeletion = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));

    setImagesToDelete((prev) => (prev.includes(id) ? prev : [...prev, id]));

    if (primaryImageId === id) {
      setPrimaryImageId(null);
    }
  };

  /* ===============================
     UPDATE PRODUCT
  =============================== */

  const updateProduct = async () => {
    if (!isValid) {
      toast.error('Complete required fields');

      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append('name', form.name.trim());

      formData.append('description', form.description.trim());

      formData.append('price', String(Math.round(Number(form.price) * 100)));

      formData.append('brandId', form.brandId);

      formData.append('category', form.category);

      formData.append('gender', form.gender);

      formData.append('variants', JSON.stringify(form.variants));

      formData.append('imagesToDelete', JSON.stringify(imagesToDelete));

      formData.append('primaryImageId', primaryImageId ?? '');

      files.forEach((file) => formData.append('images', file));

      const res = await apiFetch(`/products/${product.id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!res || !res.ok) {
        throw new Error('Update product failed');
      }

      toast.success('Product updated successfully');

      onUpdated();
      onClose();
    } catch {
      toast.error('Error updating product');
    } finally {
      setLoading(false);
    }
  };

  const groupedVariants = form.variants.reduce(
    (acc, variant) => {
      if (!acc[variant.color]) {
        acc[variant.color] = [];
      }

      acc[variant.color].push(variant);

      return acc;
    },
    {} as Record<string, typeof form.variants>,
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      <div className="premium-scrollbar max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-t-3xl border border-white/10 bg-neutral-950 shadow-2xl shadow-black/50 sm:rounded-3xl">
        {/* HEADER */}

        <div className="sticky top-0 z-20 flex items-start justify-between border-b border-white/10 bg-neutral-950/95 p-5 backdrop-blur sm:p-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-semibold text-sky-200">
              <Save size={14} />
              Edit product
            </div>

            <h2 className="mt-3 text-xl font-semibold text-white sm:text-2xl">Edit product</h2>

            <p className="mt-1 text-sm text-neutral-400">
              Update variants, media and inventory from the dashboard.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-neutral-500 transition hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* CONTENT */}

        <div className="space-y-6 p-5 sm:p-6">
          {/* BASIC */}

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Product name" required>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="dashboard-input"
              />
            </Field>

            <Field label="Price" required>
              <input
                name="price"
                type="number"
                min="0"
                value={form.price}
                onChange={handleChange}
                className="dashboard-input"
              />
            </Field>
          </div>

          <Field label="Description">
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={5}
              className="dashboard-input resize-none"
            />
          </Field>

          {/* CATEGORY */}

          <div className="grid gap-5 md:grid-cols-3">
            <Field label="Category">
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="dashboard-input"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Gender">
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="dashboard-input"
              >
                {genders.map((gender) => (
                  <option key={gender.value} value={gender.value}>
                    {gender.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Brand">
              <select
                name="brandId"
                value={form.brandId}
                onChange={handleChange}
                className="dashboard-input"
              >
                <option value="">No brand</option>

                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {/* VARIANTS */}

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white sm:text-base">
                  Variantes de Productos
                </h3>

                <p className="mt-1 text-xs leading-relaxed text-neutral-500">
                  Manage sizes, colors and inventory independently.
                </p>
              </div>
            </div>
            <div className="mb-6 space-y-5">
              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                  <Field label="Color">
                    <div className="relative">
                      <select
                        value={variantColor}
                        onChange={(e) => setVariantColor(e.target.value)}
                        className="dashboard-input dashboard-input appearance-none"
                      >
                        {colors.map((color) => (
                          <option key={color}>{color}</option>
                        ))}
                      </select>
                      <svg
                        className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-neutral-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </Field>

                  <Field label="Stock inicial">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setDefaultStock((prev) => Math.max(0, prev - 1))}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-lg font-bold"
                      >
                        −
                      </button>

                      <input
                        type="number"
                        min="0"
                        value={defaultStock}
                        onChange={(e) => setDefaultStock(Number(e.target.value))}
                        className="no-spinner h-10 w-20 rounded-xl border border-white/10 bg-transparent text-center font-semibold"
                      />

                      <button
                        type="button"
                        onClick={() => setDefaultStock((prev) => prev + 1)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-lg font-bold"
                      >
                        +
                      </button>
                    </div>
                  </Field>
                </div>

                <div>
                  <p className="mb-3 text-sm font-medium text-white">Tallas</p>

                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        className={`flex h-10 ${size === 'ONE_SIZE' ? 'w-auto px-3' : 'w-10'} items-center justify-center rounded-xl border text-sm font-medium transition ${
                          selectedSizes.includes(size)
                            ? 'border-white bg-white text-black'
                            : 'border-white/10 text-white hover:bg-white/[0.05]'
                        } `}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-sm text-neutral-400">
                {selectedSizes.length === 0
                  ? 'Selecciona al menos una talla'
                  : `${selectedSizes.length} talla${
                      selectedSizes.length > 1 ? 's' : ''
                    } seleccionada${selectedSizes.length > 1 ? 's' : ''}`}
              </p>

              <button
                type="button"
                onClick={generateVariants}
                disabled={selectedSizes.length === 0}
                className="w-full rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-40 md:w-auto"
              >
                {selectedSizes.length === 0
                  ? 'Selecciona tallas'
                  : `Generar ${selectedSizes.length} variante${
                      selectedSizes.length > 1 ? 's' : ''
                    }`}
              </button>
            </div>

            <div className="mt-6 space-y-6">
              {Object.entries(groupedVariants).map(([color, variants]) => (
                <div key={color}>
                  <div className="mb-3 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-white/40" />

                    <h4 className="text-sm font-semibold text-white">
                      ⚫ {color}
                      <span className="ml-2 text-xs text-neutral-500">
                        {variants.length} variante
                        {variants.length > 1 ? 's' : ''}
                      </span>
                    </h4>
                  </div>

                  <div className="space-y-2">
                    {variants
                      .sort((a, b) => SIZE_ORDER.indexOf(a.size) - SIZE_ORDER.indexOf(b.size))
                      .map((variant) => {
                        const realIndex = form.variants.findIndex(
                          (v) => v.size === variant.size && v.color === variant.color,
                        );

                        return (
                          <div
                            key={`${variant.size}-${variant.color}`}
                            className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2"
                          >
                            <p className="font-medium text-white">{variant.size}</p>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  updateVariant(
                                    realIndex,
                                    'stock',
                                    String(Math.max(0, Number(variant.stock) - 1)),
                                  )
                                }
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10"
                              >
                                −
                              </button>

                              <input
                                type="number"
                                min="0"
                                value={variant.stock}
                                onChange={(e) => updateVariant(realIndex, 'stock', e.target.value)}
                                className="no-spinner h-8 w-16 rounded-lg border border-white/10 bg-transparent text-center text-sm"
                              />

                              <button
                                type="button"
                                onClick={() =>
                                  updateVariant(
                                    realIndex,
                                    'stock',
                                    String(Number(variant.stock) + 1),
                                  )
                                }
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10"
                              >
                                +
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm('¿Eliminar esta variante?')) {
                                    removeVariant(realIndex);
                                  }
                                }}
                                className="ml-2 flex h-7 w-7 items-center justify-center rounded-lg border border-red-500/20 text-red-300"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* IMAGES */}

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-white">Gallery</h3>

                <p className="mt-1 text-xs text-neutral-500">
                  Manage cover image and media assets.
                </p>
              </div>

              <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-xs font-semibold text-white transition hover:bg-white/10">
                <ImagePlus size={14} />
                Add images
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) =>
                    setFiles((prev) => [...prev, ...Array.from(event.target.files ?? [])])
                  }
                />
              </label>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="group relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]"
                >
                  <img src={img.url} alt={product.name} className="h-full w-full object-cover" />

                  <button
                    onClick={() => setPrimaryImageId(img.id)}
                    className={`absolute bottom-2 left-2 rounded-full p-1.5 transition ${
                      primaryImageId === img.id
                        ? 'bg-yellow-400 text-black'
                        : 'bg-black/70 text-white hover:bg-yellow-400 hover:text-black'
                    }`}
                  >
                    <Star size={14} fill={primaryImageId === img.id ? 'currentColor' : 'none'} />
                  </button>

                  <button
                    onClick={() => markImageForDeletion(img.id)}
                    className="absolute top-2 right-2 rounded-full bg-black/70 p-1.5 text-white transition hover:bg-red-500"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}

              {previews.map((preview, index) => (
                <div
                  key={`${preview.name}-${index}`}
                  className="relative aspect-square overflow-hidden rounded-2xl border border-emerald-400/20 bg-emerald-400/10"
                >
                  <img
                    src={preview.url}
                    alt={preview.name}
                    className="h-full w-full object-cover"
                  />

                  <span className="absolute bottom-2 left-2 rounded-full bg-emerald-300 px-2 py-1 text-[10px] font-bold text-black">
                    New
                  </span>

                  <button
                    onClick={() => setFiles((prev) => prev.filter((_, i) => i !== index))}
                    className="absolute top-2 right-2 rounded-full bg-black/70 p-1.5 text-white transition hover:bg-red-500"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FOOTER */}

        <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-white/10 bg-neutral-950/95 p-5 backdrop-blur sm:flex-row sm:justify-end sm:p-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-neutral-300 transition hover:bg-white/10 disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            onClick={updateProduct}
            disabled={loading || !isValid}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-neutral-200 disabled:opacity-60"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}

            {loading ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="flex items-center gap-2 text-sm font-medium text-neutral-200">
        {label}

        {required && <span className="text-emerald-300">*</span>}
      </span>

      {children}
    </label>
  );
}
