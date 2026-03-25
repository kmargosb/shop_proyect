"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import RelatedProducts from "@/features/products/components/RelatedProducts";

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

  /* ===============================
     STOCK STATUS
  =============================== */

  let stockBadge = null;

  if (product.stock === 0) {
    stockBadge = <span className="text-red-500 font-semibold">Sin stock</span>;
  } else if (product.stock <= 5) {
    stockBadge = (
      <span className="text-yellow-400 font-semibold">
        Solo quedan {product.stock}
      </span>
    );
  } else {
    stockBadge = <span className="text-green-500 font-semibold">En stock</span>;
  }

  /* ===============================
     ACTIONS
  =============================== */

  const handleAddToCart = async () => {
    await addItem(product.id, quantity);
  };

  const handleBuyNow = async () => {
    await addItem(product.id, quantity);
    router.push("/checkout");
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
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-3 py-1 hover:bg-neutral-800 cursor-pointer"
            >
              -
            </button>

            <span className="px-4">{quantity}</span>

            <button
              onClick={() =>
                setQuantity((q) => Math.min(product.stock || 10, q + 1))
              }
              className="px-3 py-1 hover:bg-neutral-800 cursor-pointer"
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
            className="bg-white text-black hover:bg-neutral-200 cursor-pointer"
          >
            Añadir al carrito
          </Button>

          <Button
            onClick={handleBuyNow}
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
