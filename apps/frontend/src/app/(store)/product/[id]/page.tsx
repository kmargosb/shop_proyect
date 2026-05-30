"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import RelatedProducts from "@/features/products/components/RelatedProducts";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { useCart } from "@/features/cart/CartContext";
import { apiFetch } from "@/shared/lib/api";

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();

  const { addItem } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  const [loading, setLoading] = useState(true);

  /* ===============================
     LOAD PRODUCT
  =============================== */

  useEffect(() => {
    const loadProduct = async () => {
      const res = await apiFetch(`/products/${id}`);

      if (!res || !res.ok) {
        console.error("Product fetch failed");
        return;
      }

      const data = await res.json();

      setProduct(data);

      if (data.variants?.length) {
        const firstAvailableVariant =
          data.variants.find(
            (variant: any) => variant.stock - variant.reservedStock > 0,
          ) ?? data.variants[0];

        setSelectedSize(firstAvailableVariant.size);
        setSelectedColor(firstAvailableVariant.color);
      }

      setLoading(false);
    };

    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        Cargando producto...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        Producto no encontrado
      </div>
    );
  }

  /* ===============================
     IMAGE ORDER (PRIMARY FIRST)
  =============================== */

  const images = [...(product.images ?? [])].sort(
    (a: any, b: any) => Number(b.isPrimary) - Number(a.isPrimary),
  );

  const mainImage = images[selectedImage]?.url ?? "/placeholder-product.png";

  const variants = product.variants ?? [];

  const sizes = Array.from(
    new Set<string>(variants.map((v: any) => String(v.size))),
  );

  const colors = Array.from(
    new Set<string>(variants.map((v: any) => String(v.color))),
  );

  const selectedVariant =
    variants.find(
      (variant: any) =>
        variant.size === selectedSize && variant.color === selectedColor,
    ) ?? null;

  const availableStock =
    (selectedVariant?.stock ?? 0) - (selectedVariant?.reservedStock ?? 0);

  const outOfStock = availableStock <= 0;

  /* ===============================
   STOCK STATUS
=============================== */

  let stockBadge = null;

  if (outOfStock) {
    stockBadge = <span className="text-red-500 font-medium">Agotado</span>;
  } else if (availableStock <= 5) {
    stockBadge = (
      <span className="text-amber-400 font-medium">Últimas unidades</span>
    );
  } else {
    stockBadge = (
      <span className="text-emerald-500 font-medium">Disponible</span>
    );
  }

  /* ===============================
     ACTIONS
  =============================== */

  const handleAddToCart = async () => {
    try {
      if (!selectedVariant) {
        toast.error("Selecciona una talla y color");
        return;
      }

      await addItem(product.id, selectedVariant.id, quantity);

      toast.success("Producto añadido al carrito");
    } catch (error: any) {
      toast.error(error?.message || "No hay suficiente stock");
    }
  };

  const handleBuyNow = async () => {
    try {
      if (!selectedVariant) {
        toast.error("Selecciona una talla y color");
        return;
      }

      await addItem(product.id, selectedVariant.id, quantity);

      toast.success("Producto añadido al carrito");

      router.push("/checkout");
    } catch (error: any) {
      toast.error(error?.message || "No hay suficiente stock");
    }
  };

  /* ===============================
     UI
  =============================== */

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 space-y-24">
      <main className="grid md:grid-cols-2 gap-14">
        {/* ===============================
         IMAGE GALLERY
      =============================== */}

        <div className="space-y-4">
          <div className="relative aspect-square bg-neutral-900 rounded-xl overflow-hidden">
            <Image
              src={mainImage}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>

          {images.length > 1 && (
            <div className="flex gap-3 flex-wrap">
              {images.map((img: any, index: number) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(index)}
                  className={`relative w-20 h-20 rounded-md overflow-hidden border
                ${
                  selectedImage === index
                    ? "border-white"
                    : "border-neutral-700"
                } cursor-pointer`}
                >
                  <Image
                    src={img.url}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ===============================
         PRODUCT INFO
      =============================== */}

        <div className="space-y-6">
          <h1 className="text-3xl font-bold">{product.name}</h1>

          <p className="text-2xl font-semibold">
            €{(product.price / 100).toFixed(2)}
          </p>

          {stockBadge}

          <div className="space-y-6">
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.25em] text-neutral-500">
                Size
              </p>

              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`h-11 min-w-[52px] rounded-xl border px-4 transition
          ${
            selectedSize === size
              ? "border-white bg-white text-black"
              : "border-neutral-700 hover:border-neutral-500"
          }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.25em] text-neutral-500">
                Color
              </p>

              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`h-11 rounded-xl border px-4 transition
          ${
            selectedColor === color
              ? "border-white bg-white text-black"
              : "border-neutral-700 hover:border-neutral-500"
          }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {product.description && (
            <p className="text-neutral-400 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* ===============================
           QUANTITY SELECTOR
        =============================== */}

          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-400">Cantidad</span>

            <div className="flex items-center border border-neutral-700 rounded-md">
              <button
                disabled={outOfStock}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-1 hover:bg-neutral-800 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
              >
                -
              </button>

              <span className="px-4">{quantity}</span>

              <button
                disabled={outOfStock}
                onClick={() =>
                  setQuantity((q) => Math.min(availableStock, q + 1))
                }
                className="px-3 py-1 hover:bg-neutral-800 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>

          {/* ===============================
           ACTION BUTTONS
        =============================== */}

          <div className="flex gap-4">
            <Button
              onClick={handleAddToCart}
              disabled={outOfStock}
              className="bg-white text-black hover:bg-neutral-200 cursor-pointer disabled:bg-neutral-700 disabled:text-neutral-400"
            >
              Añadir al carrito
            </Button>

            <Button
              onClick={handleBuyNow}
              disabled={outOfStock}
              variant="outline"
              className="cursor-pointer"
            >
              Comprar ahora
            </Button>
          </div>
        </div>
      </main>

      {/* ===============================
       RELATED PRODUCTS
    =============================== */}

      <RelatedProducts productId={product.id} />
    </div>
  );
}
