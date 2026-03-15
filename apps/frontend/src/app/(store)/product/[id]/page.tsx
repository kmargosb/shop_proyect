"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/CartContext";
import { apiFetch } from "@/lib/api";

export default function ProductPage() {
  const { id } = useParams();

  const { addItem } = useCart();

  const [product, setProduct] = useState<any>(null);

  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const loadProduct = async () => {
      const res = await apiFetch(`/products/${id}`);

      if (!res || !res.ok) {
        console.error("Product fetch failed");
        return;
      }

      const data = await res.json();

      setProduct(data);
    };

    loadProduct();
  }, [id]);

  if (!product) {
    return <div className="p-10">Cargando producto...</div>;
  }

  const images = product.images ?? [];

  const mainImage = images[selectedImage]?.url ?? "/placeholder-product.png";

  const handleAddToCart = async () => {
    await addItem(product.id, 1);
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12">
      {/* IMAGE GALLERY */}

      <div className="space-y-4">
        <div className="relative aspect-square bg-neutral-900 rounded-xl overflow-hidden">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>

        {/* THUMBNAILS */}

        {images.length > 1 && (
          <div className="flex gap-3">
            {images.map((img: any, index: number) => (
              <button
                key={img.id}
                onClick={() => setSelectedImage(index)}
                className="relative w-20 h-20 rounded-md overflow-hidden border border-neutral-700 cursor-pointer"
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

      {/* PRODUCT INFO */}

      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{product.name}</h1>

        <p className="text-2xl font-semibold">
          €{(product.price / 100).toFixed(2)}
        </p>

        {product.description && (
          <p className="text-neutral-400">{product.description}</p>
        )}

        <Button
          onClick={handleAddToCart}
          className="bg-white text-black hover:bg-neutral-200 cursor-pointer"
        >
          Añadir al carrito
        </Button>
      </div>
    </main>
  );
}
