"use client";

import Image from "next/image";
import RelatedProducts from "@/features/products/components/RelatedProducts";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { useCart } from "@/features/cart/CartContext";
import { apiFetch } from "@/shared/lib/api";
import { socket } from "@/shared/lib/socket";
import { Heart } from "lucide-react";
import { useWishlist } from "@/features/wishlist/WishListContext";

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
  const { isWishlisted, toggleWishlist } = useWishlist();

  /* ===============================
     LOAD PRODUCT
  =============================== */

  const loadProduct = async () => {
    const res = await apiFetch(`/products/${id}`);

    if (!res || !res.ok) {
      setLoading(false);
      return;
    }

    const data = await res.json();

    setProduct(data);

    if (data.variants?.length) {
      const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"];

      const COLOR_ORDER = [
        "WHITE",
        "BLACK",
        "CREAM",
        "BEIGE",
        "GREY",
        "GRAY",
        "BROWN",
        "GREEN",
        "BLUE",
        "RED",
      ];

      const sortedVariants = [...data.variants].sort((a: any, b: any) => {
        const colorDiff =
          COLOR_ORDER.indexOf(a.color?.toUpperCase()) -
          COLOR_ORDER.indexOf(b.color?.toUpperCase());

        if (colorDiff !== 0) return colorDiff;

        return SIZE_ORDER.indexOf(a.size) - SIZE_ORDER.indexOf(b.size);
      });

      const firstAvailableVariant =
        sortedVariants.find(
          (variant: any) => variant.stock - variant.reservedStock > 0,
        ) ?? sortedVariants[0];

      setSelectedSize(firstAvailableVariant.size);
      setSelectedColor(firstAvailableVariant.color);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadProduct();
  }, [id]);

  useEffect(() => {
    const handleProductUpdated = (payload: { productId: string }) => {
      if (payload.productId === id) {
        loadProduct();
      }
    };

    socket.on("productUpdated", handleProductUpdated);

    return () => {
      socket.off("productUpdated", handleProductUpdated);
    };
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

  const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"];

  const sizes = Array.from(
    new Set<string>(variants.map((v: any) => String(v.size))),
  ).sort((a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b));

  const COLOR_ORDER = [
    "WHITE",
    "BLACK",
    "CREAM",
    "BEIGE",
    "GREY",
    "GRAY",
    "BROWN",
    "GREEN",
    "BLUE",
    "RED",
  ];

  const colors = Array.from(
    new Set<string>(variants.map((v: any) => String(v.color))),
  ).sort((a, b) => {
    const ai = COLOR_ORDER.indexOf(a.toUpperCase());
    const bi = COLOR_ORDER.indexOf(b.toUpperCase());

    if (ai === -1 && bi === -1) {
      return a.localeCompare(b);
    }

    if (ai === -1) return 1;
    if (bi === -1) return -1;

    return ai - bi;
  });

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
    stockBadge = <span className="text-red-500 font-medium">Sold Out</span>;
  } else if (availableStock <= 5) {
    stockBadge = (
      <span className="text-amber-400 font-medium">Low stock</span>
    );
  } else {
    stockBadge = (
      <span className="text-emerald-500 font-medium">In Stock</span>
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

      await addItem(product.id, selectedVariant.id, quantity, false);

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
          {product.brand?.name && (
            <p className="text-m uppercase tracking-[0.3em] text-neutral-500">
              {product.brand.name}
            </p>
          )}

          <div className="flex items-center gap-3">
  <h1 className="text-3xl font-bold">
    {product.name}
  </h1>

            <button
              onClick={() => toggleWishlist(product.id)}
              title={isWishlisted(product.id) ? "Saved" : "Save for later"}
              className="rounded-full p-2 transition hover:bg-white/5"
            >
              <Heart
                size={22}
                className={
                  isWishlisted(product.id)
                    ? "fill-rose-500 text-rose-500"
                    : "text-neutral-500"
                }
              />
            </button>
          </div>

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
                    onClick={() => {
                      setSelectedSize(size);
                      setQuantity(1);
                    }}
                    className={`h-11 min-w-[52px] rounded-xl border px-4 cursor-pointer transition-all duration-200
          ${
            selectedSize === size
              ? "border-white bg-neutral-900 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.25)]"
              : "border-neutral-700 hover:border-neutral-500 text-neutral-700"
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

              <div className="flex flex-wrap gap-5">
                {colors.map((color) => {
                  const colorMap: Record<string, string> = {
                    WHITE: "bg-white border border-neutral-500",
                    BLACK: "bg-black",
                    CREAM: "bg-yellow-50",
                    BEIGE: "bg-stone-200",
                    GREY: "bg-neutral-500",
                    GRAY: "bg-neutral-500",
                    BROWN: "bg-amber-800",
                    GREEN: "bg-green-700",
                    BLUE: "bg-blue-700",
                    RED: "bg-red-700",
                  };

                  const swatch =
                    colorMap[color.toUpperCase()] ?? "bg-neutral-400";

                  const active = selectedColor === color;

                  return (
                    <button
                      key={color}
                      onClick={() => {
                        if (selectedColor === color) return;
                        setSelectedColor(color);
                        setQuantity(1);

                        const variantsForColor = variants
                          .filter((v: any) => v.color === color)
                          .sort((a: any, b: any) => {
                            const SIZE_ORDER = [
                              "XS",
                              "S",
                              "M",
                              "L",
                              "XL",
                              "XXL",
                            ];

                            return (
                              SIZE_ORDER.indexOf(a.size) -
                              SIZE_ORDER.indexOf(b.size)
                            );
                          });

                        const firstAvailable =
                          variantsForColor.find(
                            (v: any) => v.stock - v.reservedStock > 0,
                          ) ?? variantsForColor[0];

                        if (firstAvailable) {
                          setSelectedSize(firstAvailable.size);
                        }
                      }}
                      className="flex flex-col items-center gap-2 cursor-pointer"
                    >
                      <span
                        className={`
                          flex items-center justify-center
                          h-8 w-8 rounded-full
                          transition-all duration-200
                          ${active ? "border-black scale-140" : "border-neutral-400"}`}
                      >
                        <span className={`h-5 w-5 rounded-full ${swatch}`} />
                      </span>

                      <span
                        className={`text-xs uppercase tracking-wide ${
                          active
                            ? "text-black font-semibold"
                            : "text-neutral-400"
                        }`}
                      >
                        {color}
                      </span>
                    </button>
                  );
                })}
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
            <span className="text-sm text-neutral-400">Quantity</span>

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
              className="
    bg-white text-black
    hover:bg-neutral-200
    shadow-sm hover:shadow-md
    transition-all
    cursor-pointer
    disabled:bg-neutral-700
    disabled:text-neutral-400
  "
            >
              Add to cart
            </Button>

            <Button
              onClick={handleBuyNow}
              disabled={outOfStock}
              variant="outline"
              className="
    cursor-pointer
    shadow-sm hover:shadow-md
    transition-all
  "
            >
              Buy now
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
