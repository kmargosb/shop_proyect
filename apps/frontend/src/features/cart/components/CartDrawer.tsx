"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/CartContext";

export default function CartDrawer() {
  const { items, open, setOpen, removeItem } = useCart();

  const total = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

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
          <p className="text-lg font-bold mb-4">
            Total: ${total.toFixed(2)}
          </p>

          <Button className="w-full">
            Finalizar compra
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}