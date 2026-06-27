'use client';

import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/shared/ui/sheet';
import { Button } from '@/shared/ui/button';
import { useCart, CartItem } from '@/features/cart/CartContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useLanguage } from '@/shared/i18n/LanguageContext';

export default function CartDrawer() {
  const { items, open, setOpen, removeItem, increaseQuantity, decreaseQuantity, totalPrice } =
    useCart();
  const router = useRouter();
  const { t } = useLanguage();
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
        className="flex h-[100dvh] w-full max-w-[440px] flex-col border-l border-white/10 bg-neutral-950 px-5 pt-6 pb-[calc(env(safe-area-inset-bottom)+20px)] text-white sm:px-6"
      >
        {/* ACCESSIBILITY */}
        <SheetTitle className="sr-only">{t.cart.title}</SheetTitle>
        <SheetDescription className="sr-only">{t.cart.productsInCart}</SheetDescription>

        {/* HEADER */}
        <div className="border-b border-white/10 pb-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] tracking-[0.25em] text-neutral-500 uppercase">
                CAMARGUETTE
              </p>

              <h2 className="mt-1 text-lg font-semibold">{t.cart.title}</h2>
            </div>

            <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-neutral-400">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>

        {/* SHIPPING BAR */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">{unlocked ? '🎉' : '🚚'}</span>

              <p className="text-xs text-neutral-300">
                {unlocked
                  ? t.cart.freeShippingUnlocked
                  : `${t.cart.addForFreeShipping} €${remaining.toFixed(2)} ${t.cart.forFreeShipping}`}
              </p>
            </div>

            <span className="text-[11px] text-neutral-500">{Math.round(progress)}%</span>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full transition-all duration-500 ${
                unlocked ? 'bg-green-400' : 'bg-white'
              }`}
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>

        {/* ITEMS */}
        <div className="mt-6 flex-1 space-y-4 overflow-y-auto overscroll-contain pr-1 [-webkit-overflow-scrolling:touch]">
          {items.length === 0 && <p className="text-sm text-neutral-500">{t.cart.empty}</p>}

          {items.map((item: CartItem) => (
            <div
              key={item.id}
              className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.05]"
            >
              {/* IMAGE */}
              <div className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl bg-white/10">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-white/5" />
                )}
              </div>

              {/* INFO */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-medium">{item.name}</p>
                {(item.size || item.color) && (
                  <p className="mt-2 text-sm text-neutral-400">
                    {item.size && `${t.cart.size} ${item.size}`}
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
                    className="h-9 w-9 rounded-md bg-white/10 transition hover:bg-white/20"
                  >
                    −
                  </motion.button>

                  <span className="w-6 text-center text-sm">{item.quantity}</span>

                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => increaseQuantity(item.id)}
                    className="h-9 w-9 rounded-md bg-white/10 transition hover:bg-white/20"
                  >
                    +
                  </motion.button>
                </div>

                {/* REMOVE */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="mt-2 text-xs text-neutral-500 transition hover:text-red-400"
                >
                  {t.cart.remove}
                </button>
              </div>

              {/* PRICE */}
              <div className="text-[15px] font-semibold whitespace-nowrap">
                €{((item.price * item.quantity) / 100).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className="space-y-4 border-t border-white/10 pt-5">
          <div className="flex items-center justify-between text-sm text-neutral-400">
            <span>{t.cart.subtotal}</span>

            <span>€{total.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xl font-semibold">
            <span>{t.cart.total}</span>

            <span>€{total.toFixed(2)}</span>
          </div>

          <motion.div whileTap={{ scale: 0.97 }}>
            <Button
              className="h-14 w-full rounded-2xl bg-white text-black transition-all hover:bg-neutral-200"
              onClick={() => {
                setOpen(false);
                router.push('/checkout');
              }}
            >
              {t.cart.checkout} →
            </Button>
          </motion.div>

          <p className="text-center text-[12px] text-neutral-500">
            {t.cart.securePayment} · {t.cart.fastDelivery} · {t.cart.premiumSupport}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
