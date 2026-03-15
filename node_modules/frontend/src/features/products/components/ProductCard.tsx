"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useCart } from "@/features/cart/CartContext"
import type { Product } from "@/types/product"

type Props = {
  product: Product
}

export default function ProductCard({ product }: Props) {

  const { addItem } = useCart()

  const handleAddToCart = async () => {
    await addItem(product.id, 1)
  }

  const imageUrl =
    product.images?.[0]?.url ?? "/placeholder-product.png"

  return (

    <div className="group bg-neutral-900 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">

      {/* IMAGE */}

      <div className="relative aspect-square overflow-hidden">

        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

      </div>

      {/* INFO */}

      <div className="p-4 space-y-3">

        <h3 className="text-sm font-medium text-white line-clamp-2">
          {product.name}
        </h3>

        <p className="text-lg font-semibold text-white">
          €{(product.price / 100).toFixed(2)}
        </p>

        <Button
          onClick={handleAddToCart}
          className="w-full bg-white text-black hover:bg-neutral-200 cursor-pointer"
        >
          Añadir al carrito
        </Button>

      </div>

    </div>

  )
}