'use client';

import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/shared/ui/sheet';
import { Button } from '@/shared/ui/button';
import { useCart } from '@/features/cart/CartContext';
import type { CartItem } from '@/features/cart/types';
import { useCartUI } from '@/features/cart/CartUIContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useLanguage } from '@/shared/i18n/LanguageContext';

export default function CartDrawer() {
  const { items, removeItem, increaseQuantity, decreaseQuantity, totalPrice } = useCart();
  const { isOpen, closeCart } = useCartUI();
  const router = useRouter();
  const { t } = useLanguage();
  const total = totalPrice / 100;

  /* ================= SHIPPING ================= */

  const FREE_SHIPPING = 50;
  const progress = Math.min(100, (total / FREE_SHIPPING) * 100);
  const remaining = Math.max(0, FREE_SHIPPING - total);
  const unlocked = remaining === 0;

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          closeCart();
        }
      }}
    >
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
        <div className="mt-6 flex-1 space-y-2 overflow-y-auto overscroll-contain pr-1 [-webkit-overflow-scrolling:touch]">
          {items.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-5 text-5xl">🛍️</div>

              <h3 className="text-xl font-semibold text-white">{t.cart.empty}</h3>

              <p className="mt-3 max-w-xs text-sm leading-relaxed text-neutral-400">
                Discover our latest collection.
              </p>

              <Button
                className="mt-8 rounded-2xl bg-white px-8 text-black hover:bg-neutral-200"
                onClick={() => {
                  closeCart();
                  router.push('/shop');
                }}
              >
                Continue shopping
              </Button>
            </div>
          )}

          {items.length > 0 &&
            items.map((item: CartItem) => {
              console.log('CART IMAGE:', item.name, item.image);

              return (
                <div
                  key={item.id}
                  className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-2.5 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.05]"
                >
                  {/* IMAGE */}
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white/10">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-white/5" />
                    )}
                  </div>

                  {/* LEFT */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-medium">{item.name}</p>
                    {(item.size || item.color) && (
                      <p className="mt-1 text-xs text-neutral-400">
                        {item.size && `${t.cart.size} ${item.size}`}
                        {item.size && item.color && ' · '}
                        {item.color}
                      </p>
                    )}
                    <div className="mt-1 flex items-center gap-3">
                      <p className="text-[11px] text-neutral-400">
                        €{(item.price / 100).toFixed(2)}
                      </p>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-[11px] text-neutral-500 transition hover:text-red-400"
                      >
                        {t.cart.remove}
                      </button>
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="flex flex-col items-end">
                    <p className="text-[14px] font-semibold whitespace-nowrap">
                      €{((item.price * item.quantity) / 100).toFixed(2)}
                    </p>

                    <div className="mt-1 flex items-center gap-1.5">
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={() => decreaseQuantity(item.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-md bg-white/10 transition hover:bg-white/20"
                      >
                        −
                      </motion.button>

                      <span className="w-5 text-center text-xs">{item.quantity}</span>

                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={() => increaseQuantity(item.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-md bg-white/10 transition hover:bg-white/20"
                      >
                        +
                      </motion.button>
                    </div>
                  </div>
                </div>
              );
            })}
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
                closeCart();
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
