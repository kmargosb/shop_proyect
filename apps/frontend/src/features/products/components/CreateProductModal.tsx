'use client';

import type { ReactNode } from 'react';
import type { ProductBrand } from '@/types/product';
import { ImagePlus, Loader2, PackagePlus, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/shared/lib/api';
import { toast } from 'sonner';

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
  { value: 'SPECIAL_ITEMS', label: 'Special Items' },
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

const colors = ['WHITE', 'BLACK', 'BEIGE', 'GREY', 'GREEN', 'RED', 'BLUE', 'BROWN'];

type Props = {
  onClose: () => void;
  onCreated: () => void;
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

const emptyForm: ProductForm = {
  name: '',
  description: '',
  price: '',
  brandId: '',
  category: 'OTHER',
  gender: 'UNISEX',
  variants: [],
};

export default function CreateProductModal({ onClose, onCreated }: Props) {
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [brands, setBrands] = useState<ProductBrand[]>([]);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [inventoryType, setInventoryType] = useState<'simple' | 'variants'>('variants');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [variantColor, setVariantColor] = useState('BLACK');
  const [defaultStock, setDefaultStock] = useState(5);

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

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const previews = useMemo(
    () =>
      files.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
      })),
    [files],
  );

  const isValid = form.name.trim() && Number(form.price) >= 0 && form.variants.length > 0;

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
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

  const createProduct = async () => {
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

      files.forEach((file) => {
        formData.append('images', file);
      });

      const res = await apiFetch('/products', {
        method: 'POST',
        body: formData,
      });

      if (!res || !res.ok) {
        throw new Error('Create product failed');
      }

      toast.success('Product created successfully');

      onCreated();
      onClose();
    } catch {
      toast.error('Error creating product');
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="premium-scrollbar max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-t-3xl border border-white/10 bg-neutral-950 shadow-2xl shadow-black/50 sm:rounded-3xl">
        {/* HEADER */}

        <div className="sticky top-0 z-20 flex items-start justify-between border-b border-white/10 bg-neutral-950/95 p-5 backdrop-blur sm:p-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
              <PackagePlus size={14} />
              New product
            </div>

            <h2 className="mt-3 text-xl font-semibold text-white sm:text-2xl">Create product</h2>

            <p className="mt-1 text-sm text-neutral-400">
              Premium inventory management with variants and media.
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
                placeholder="Women From A Broken Future Tee"
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
                placeholder="45.00"
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
              placeholder="Premium heavyweight cotton..."
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

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="text-sm font-semibold text-white">Tipo de inventario</h3>

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setInventoryType('simple')}
                className={`rounded-2xl px-4 py-3 text-sm ${
                  inventoryType === 'simple'
                    ? 'bg-white text-black'
                    : 'border border-white/10 text-white'
                }`}
              >
                Stock simple
              </button>

              <button
                type="button"
                onClick={() => setInventoryType('variants')}
                className={`rounded-2xl px-4 py-3 text-sm ${
                  inventoryType === 'variants'
                    ? 'bg-white text-black'
                    : 'border border-white/10 text-white'
                }`}
              >
                Variantes
              </button>
            </div>
          </div>

          {inventoryType === 'simple' && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <Field label="Stock total">
                <input type="number" min="0" className="dashboard-input" />
              </Field>
            </div>
          )}

          {/* VARIANTS */}

          {inventoryType === 'variants' && (
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
                                  onChange={(e) =>
                                    updateVariant(realIndex, 'stock', e.target.value)
                                  }
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
          )}

          {/* IMAGES */}

          <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.03] p-5">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl bg-black/20 p-8 text-center transition hover:bg-white/[0.04]">
              <ImagePlus className="text-neutral-500" size={30} />

              <span className="mt-4 text-sm font-semibold text-white">Upload product images</span>

              <span className="mt-1 text-xs text-neutral-500">
                PNG, JPG or WEBP. First image becomes cover.
              </span>

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

            {previews.length > 0 && (
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
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
                      className="absolute top-2 right-2 rounded-full bg-black/70 p-1 text-white transition hover:bg-red-500"
                    >
                      <X size={14} />
                    </button>

                    {index === 0 && (
                      <span className="absolute bottom-2 left-2 rounded-full bg-white px-2 py-1 text-[10px] font-bold text-black">
                        Cover
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}

        <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-white/10 bg-neutral-950/95 p-5 backdrop-blur sm:flex-row sm:justify-end sm:p-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-neutral-300 transition hover:bg-white/10"
          >
            Cancel
          </button>

          <button
            onClick={createProduct}
            disabled={loading || !isValid}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-neutral-200 disabled:opacity-60"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}

            {loading ? 'Creating...' : 'Create product'}
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
