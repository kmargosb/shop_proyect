'use client';

import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/shared/ui/sheet';

import { Button } from '@/shared/ui/button';
import { useCart, CartItem } from '@/features/cart/CartContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function CartDrawer() {
  const { items, open, setOpen, removeItem, increaseQuantity, decreaseQuantity, totalPrice } =
    useCart();

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
        className="flex w-[420px] flex-col border-l border-white/10 bg-neutral-950 text-white"
      >
        {/* ACCESSIBILITY */}
        <SheetTitle className="sr-only">Cart</SheetTitle>
        <SheetDescription className="sr-only">Products in cart</SheetDescription>

        {/* HEADER */}
        <div className="border-b border-white/10 pb-4">
          <h2 className="text-base font-semibold">Your Cart</h2>
        </div>

        {/* SHIPPING BAR */}
        <div className="mt-5">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-lg">{unlocked ? '🎉' : '🚚'}</span>

            <p className="text-xs text-neutral-400">
              {unlocked
                ? 'Free shipping unlocked'
                : `Add €${remaining.toFixed(2)} for free shipping`}
            </p>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full transition-all duration-300 ${
                unlocked ? 'bg-green-400' : 'bg-white'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* ITEMS */}
        <div className="mt-6 flex-1 space-y-4 overflow-y-auto pr-1">
          {items.length === 0 && <p className="text-sm text-neutral-500">Your cart is empty</p>}

          {items.map((item: CartItem) => (
            <div
              key={item.id}
              className="flex gap-4 rounded-xl border border-white/10 bg-white/[0.04] p-4"
            >
              {/* IMAGE */}
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white/10">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-white/5" />
                )}
              </div>

              {/* INFO */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.name}</p>
                {(item.size || item.color) && (
                  <p className="mt-1 text-xs text-neutral-400">
                    {item.size && `Size ${item.size}`}
                    {item.size && item.color && ' · '}
                    {item.color}
                  </p>
                )}

                <p className="mt-1 text-xs text-neutral-400">€{(item.price / 100).toFixed(2)}</p>

                {/* CONTROLS */}
                <div className="mt-3 flex items-center gap-2">
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => decreaseQuantity(item.id)}
                    className="h-7 w-7 rounded-md bg-white/10 transition hover:bg-white/20"
                  >
                    −
                  </motion.button>

                  <span className="w-6 text-center text-sm">{item.quantity}</span>

                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => increaseQuantity(item.id)}
                    className="h-7 w-7 rounded-md bg-white/10 transition hover:bg-white/20"
                  >
                    +
                  </motion.button>
                </div>

                {/* REMOVE */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="mt-2 text-xs text-neutral-500 transition hover:text-red-400"
                >
                  Remove
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
        <div className="space-y-3 border-t border-white/10 pt-4">
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
              className="h-12 w-full rounded-xl bg-white text-black hover:bg-neutral-200"
              onClick={() => {
                setOpen(false);
                router.push('/checkout');
              }}
            >
              Checkout →
            </Button>
          </motion.div>

          <p className="text-center text-[11px] text-neutral-500">
            Secure payment · Fast delivery · Premium support
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
