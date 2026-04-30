"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/shared/ui/sheet";

import { Button } from "@/shared/ui/button";
import { useCart, CartItem } from "@/features/cart/CartContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function CartDrawer() {
  const {
    items,
    open,
    setOpen,
    removeItem,
    increaseQuantity,
    decreaseQuantity,
    totalPrice,
  } = useCart();

  const router = useRouter();

  const total = totalPrice / 100;

  /* ================= SHIPPING ================= */

  const FREE_SHIPPING = 50;
  const progress = Math.min(100, (total / FREE_SHIPPING) * 100);
  const remaining = Math.max(0, FREE_SHIPPING - total);
  const unlocked = remaining === 0;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="w-[420px] bg-neutral-950 text-white border-l border-white/10 flex flex-col"
      >
        {/* ACCESSIBILITY */}
        <SheetTitle className="sr-only">Carrito</SheetTitle>
        <SheetDescription className="sr-only">
          Productos en el carrito
        </SheetDescription>

        {/* HEADER */}
        <div className="pb-4 border-b border-white/10">
          <h2 className="text-base font-semibold">Tu carrito</h2>
        </div>

        {/* SHIPPING BAR */}
        <div className="mt-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{unlocked ? "🎉" : "🚚"}</span>

            <p className="text-xs text-neutral-400">
              {unlocked
                ? "Envío gratis desbloqueado"
                : `Añade €${remaining.toFixed(
                    2
                  )} para envío gratis`}
            </p>
          </div>

          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                unlocked ? "bg-green-400" : "bg-white"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* ITEMS */}
        <div className="flex-1 overflow-y-auto mt-6 space-y-4 pr-1">
          {items.length === 0 && (
            <p className="text-neutral-500 text-sm">
              Tu carrito está vacío
            </p>
          )}

          {items.map((item: CartItem) => (
            <div
              key={item.id}
              className="flex gap-4 p-4 rounded-xl bg-white/[0.04] border border-white/10"
            >
              {/* IMAGE */}
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/10 shrink-0">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-white/5" />
                )}
              </div>

              {/* INFO */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {item.name}
                </p>

                <p className="text-xs text-neutral-400 mt-1">
                  €{(item.price / 100).toFixed(2)}
                </p>

                {/* CONTROLES */}
                <div className="flex items-center gap-2 mt-3">
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => decreaseQuantity(item.id)}
                    className="w-7 h-7 rounded-md bg-white/10 hover:bg-white/20 transition"
                  >
                    −
                  </motion.button>

                  <span className="text-sm w-6 text-center">
                    {item.quantity}
                  </span>

                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => increaseQuantity(item.id)}
                    className="w-7 h-7 rounded-md bg-white/10 hover:bg-white/20 transition"
                  >
                    +
                  </motion.button>
                </div>

                {/* REMOVE */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-xs text-neutral-500 hover:text-red-400 mt-2 transition"
                >
                  Eliminar
                </button>
              </div>

              {/* PRICE */}
              <div className="text-sm font-medium whitespace-nowrap">
                €{((item.price * item.quantity) / 100).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className="border-t border-white/10 pt-4 space-y-3">
          <div className="flex justify-between text-sm text-neutral-400">
            <span>Subtotal</span>
            <span>€{total.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>€{total.toFixed(2)}</span>
          </div>

          <motion.div whileTap={{ scale: 0.97 }}>
            <Button
              className="w-full h-12 rounded-xl bg-white text-black hover:bg-neutral-200"
              onClick={() => {
                setOpen(false);
                router.push("/checkout");
              }}
            >
              Finalizar compra →
            </Button>
          </motion.div>

          <p className="text-[11px] text-neutral-500 text-center">
            Pago seguro · Entrega rápida · Soporte premium
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}