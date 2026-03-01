"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/CartContext";
import { createOrder } from "@/features/orders/api/orders.api";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CartDrawer() {
  const { items, open, setOpen, removeItem, clearCart } = useCart();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const total = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  /* =========================
     CHECKOUT
  ========================= */

  const handleCheckout = async () => {
    if (items.length === 0) return;

    setLoading(true);

    try {
      // ⚠️ luego esto vendrá de formulario checkout
      const email = prompt("Introduce tu email");
      const fullName = prompt("Nombre completo");

      if (!email || !fullName) return;

      const order = await createOrder({
        items: items.map((i) => ({
          productId: i.id,
          quantity: i.quantity,
        })),

        fullName,
        email,
        phone: "000000000",
        addressLine1: "Dirección temporal",
        city: "Ciudad",
        postalCode: "00000",
        country: "España",
      });

      clearCart();
      setOpen(false);

      router.push(`/orders/${order.id}?email=${email}`);
    } catch (err) {
      console.error(err);
      alert("Error creando pedido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-[400px]">
        <SheetHeader>
          <SheetTitle>Carrito</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {items.length === 0 && (
            <p className="text-gray-400">El carrito está vacío</p>
          )}

          {items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center bg-neutral-900 p-3 rounded-lg"
            >
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-gray-400">
                  {item.quantity} x ${item.price}
                </p>
              </div>

              <Button
                size="sm"
                variant="destructive"
                onClick={() => removeItem(item.id)}
              >
                X
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-8 border-t border-neutral-800 pt-4">
          <p className="text-lg font-bold mb-4">Total: ${total.toFixed(2)}</p>

          <Button
            className="w-full"
            onClick={() => {
              setOpen(false);
              router.push("/checkout");
            }}
          >
            Finalizar compra
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
