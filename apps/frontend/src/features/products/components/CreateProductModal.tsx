"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

import {
  ImagePlus,
  Loader2,
  PackagePlus,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import { toast } from "sonner";

import { apiFetch } from "@/shared/lib/api";

import type { ProductBrand } from "@/types/product";

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

const genders = [
  {
    value: "MEN",
    label: "Men",
  },

  {
    value: "WOMEN",
    label: "Women",
  },

  {
    value: "UNISEX",
    label: "Unisex",
  },
];

const sizes = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "ONE_SIZE",
];

const colors = [
  "BLACK",
  "WHITE",
  "BEIGE",
  "GREY",
  "GREEN",
  "RED",
  "BLUE",
  "BROWN",
];

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
  name: "",
  description: "",
  price: "",
  brandId: "",
  category: "OTHER",
  gender: "UNISEX",

  variants: [
    {
      size: "M",
      color: "BLACK",
      stock: "1",
    },
  ],
};

export default function CreateProductModal({
  onClose,
  onCreated,
}: Props) {
  const [loading, setLoading] = useState(false);

  const [files, setFiles] = useState<File[]>(
    [],
  );

  const [brands, setBrands] = useState<
    ProductBrand[]
  >([]);

  const [form, setForm] =
    useState<ProductForm>(emptyForm);

  useEffect(() => {
    async function loadBrands() {
      try {
        const res =
          await apiFetch("/brands");

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
  document.body.style.overflow = "hidden";

  return () => {
    document.body.style.overflow = "";
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

  const isValid =
    form.name.trim() &&
    Number(form.price) >= 0 &&
    form.variants.length > 0;

  const handleChange = (
    event: React.ChangeEvent<
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement
    >,
  ) => {
    setForm((prev) => ({
      ...prev,
      [event.target.name]:
        event.target.value,
    }));
  };

  const removeFile = (index: number) => {
    setFiles((prev) =>
      prev.filter((_, i) => i !== index),
    );
  };

  const updateVariant = (
    index: number,
    field: string,
    value: string,
  ) => {
    setForm((prev) => ({
      ...prev,

      variants: prev.variants.map(
        (variant, i) =>
          i === index
            ? {
                ...variant,
                [field]: value,
              }
            : variant,
      ),
    }));
  };

  const addVariant = () => {
    setForm((prev) => ({
      ...prev,

      variants: [
        ...prev.variants,

        {
          size: "M",
          color: "BLACK",
          stock: "1",
        },
      ],
    }));
  };

  const removeVariant = (
    index: number,
  ) => {
    setForm((prev) => ({
      ...prev,

      variants: prev.variants.filter(
        (_, i) => i !== index,
      ),
    }));
  };

  const createProduct = async () => {
    if (!isValid) {
      toast.error(
        "Complete required fields",
      );

      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append(
        "name",
        form.name.trim(),
      );

      formData.append(
        "description",
        form.description.trim(),
      );

      formData.append(
        "price",
        String(Math.round(Number(form.price) * 100),),
      );

      formData.append(
        "brandId",
        form.brandId,
      );

      formData.append(
        "category",
        form.category,
      );

      formData.append(
        "gender",
        form.gender,
      );

      formData.append(
        "variants",
        JSON.stringify(form.variants),
      );

      files.forEach((file) => {
        formData.append("images", file);
      });

      const res = await apiFetch(
        "/products",
        {
          method: "POST",
          body: formData,
        },
      );

      if (!res || !res.ok) {
        throw new Error(
          "Create product failed",
        );
      }

      toast.success(
        "Product created successfully",
      );

      onCreated();
      onClose();
    } catch {
      toast.error(
        "Error creating product",
      );
    } finally {
      setLoading(false);
    }
  };

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

            <h2 className="mt-3 text-xl font-semibold text-white sm:text-2xl">
              Create product
            </h2>

            <p className="mt-1 text-sm text-neutral-400">
              Premium inventory management
              with variants and media.
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
                {categories.map(
                  (category) => (
                    <option
                      key={category.value}
                      value={
                        category.value
                      }
                    >
                      {category.label}
                    </option>
                  ),
                )}
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
                  <option
                    key={gender.value}
                    value={gender.value}
                  >
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
                <option value="">
                  No brand
                </option>

                {brands.map((brand) => (
                  <option
                    key={brand.id}
                    value={brand.id}
                  >
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
                  Product variants
                </h3>

                <p className="mt-1 text-xs leading-relaxed text-neutral-500">
                  Manage sizes, colors and
                  inventory independently.
                </p>
              </div>

              <button
                type="button"
                onClick={addVariant}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs font-semibold text-white transition hover:bg-white/[0.06]"
              >
                <Plus size={14} />
                Add variant
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {form.variants.map(
                (variant, index) => (
                  <div
                    key={index}
                    className="grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 md:grid-cols-4"
                  >
                    <select
                      value={variant.size}
                      onChange={(e) =>
                        updateVariant(
                          index,
                          "size",
                          e.target.value,
                        )
                      }
                      className="dashboard-input"
                    >
                      {sizes.map((size) => (
                        <option
                          key={size}
                          value={size}
                        >
                          {size}
                        </option>
                      ))}
                    </select>

                    <select
                      value={variant.color}
                      onChange={(e) =>
                        updateVariant(
                          index,
                          "color",
                          e.target.value,
                        )
                      }
                      className="dashboard-input"
                    >
                      {colors.map(
                        (color) => (
                          <option
                            key={color}
                            value={color}
                          >
                            {color}
                          </option>
                        ),
                      )}
                    </select>

                    <input
                      type="number"
                      min="0"
                      value={variant.stock}
                      onChange={(e) =>
                        updateVariant(
                          index,
                          "stock",
                          e.target.value,
                        )
                      }
                      placeholder="Stock"
                      className="dashboard-input"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        removeVariant(index)
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs font-semibold text-red-300 transition hover:bg-red-500/20"
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  </div>
                ),
              )}
            </div>
          </div>

          {/* IMAGES */}

          <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.03] p-5">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl bg-black/20 p-8 text-center transition hover:bg-white/[0.04]">
              <ImagePlus
                className="text-neutral-500"
                size={30}
              />

              <span className="mt-4 text-sm font-semibold text-white">
                Upload product images
              </span>

              <span className="mt-1 text-xs text-neutral-500">
                PNG, JPG or WEBP. First image
                becomes cover.
              </span>

              <input
                type="file"
                multiple
                accept="image/*"
                className="sr-only"
                onChange={(event) =>
                  setFiles((prev) => [
                    ...prev,
                    ...Array.from(
                      event.target.files ??
                        [],
                    ),
                  ])
                }
              />
            </label>

            {previews.length > 0 && (
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                {previews.map(
                  (preview, index) => (
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
                        onClick={() =>
                          removeFile(index)
                        }
                        className="absolute right-2 top-2 rounded-full bg-black/70 p-1 text-white transition hover:bg-red-500"
                      >
                        <X size={14} />
                      </button>

                      {index === 0 && (
                        <span className="absolute bottom-2 left-2 rounded-full bg-white px-2 py-1 text-[10px] font-bold text-black">
                          Cover
                        </span>
                      )}
                    </div>
                  ),
                )}
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
            {loading && (
              <Loader2
                size={16}
                className="animate-spin"
              />
            )}

            {loading
              ? "Creating..."
              : "Create product"}
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

        {required && (
          <span className="text-emerald-300">
            *
          </span>
        )}
      </span>

      {children}
    </label>
  );
}