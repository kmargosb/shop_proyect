import { CartItem } from '@/features/cart/CartContext';
import { Button } from '@/shared/ui/button';
import { useLanguage } from '@/shared/i18n/LanguageContext';

type Props = {
  items: CartItem[];
  totalPrice: number;
  loading: boolean;
  isValid: boolean;
  increaseQuantity: (id: string) => Promise<void>;
  decreaseQuantity: (id: string) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
};

export default function CheckoutSummary({
  items,
  totalPrice,
  loading,
  isValid,
  increaseQuantity,
  decreaseQuantity,
  removeItem,
}: Props) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 rounded-2xl border border-white/10 bg-neutral-900 p-4 md:p-6 lg:sticky lg:top-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t.checkout.orderSummary}</h2>
        <span className="text-xs text-neutral-400">
          {items.length} {items.length === 1 ? t.checkout.item : t.checkout.items}
        </span>
      </div>

      {/* ITEMS */}
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* IMAGE  */}
              <div className="h-16 w-16 overflow-hidden rounded-lg bg-neutral-800">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] text-neutral-500">
                    IMG
                  </div>
                )}
              </div>

              {/* INFO */}
              <div className="flex flex-col">
                <span className="text-sm font-medium">{item.name}</span>

                {(item.size || item.color) && (
                  <span className="mt-1 text-xs text-neutral-400">
                    {item.size && `${t.product.size} ${item.size}`}
                    {item.size && item.color && ' · '}
                    {item.color}
                  </span>
                )}

                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => decreaseQuantity(item.id)}
                    className="h-6 w-6 rounded border border-neutral-700 transition hover:border-white"
                  >
                    -
                  </button>

                  <span className="min-w-[24px] text-center text-xs text-neutral-300">
                    {item.quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() => increaseQuantity(item.id)}
                    className="h-6 w-6 rounded border border-neutral-700 transition hover:border-white"
                  >
                    +
                  </button>

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="ml-2 text-xs text-neutral-500 transition hover:text-red-400"
                  >
                    {t.checkout.remove}
                  </button>
                </div>
              </div>
            </div>

            {/* PRICE */}
            <span className="text-sm font-medium">
              €{((item.price * item.quantity) / 100).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* DIVIDER */}
      <div className="border-t border-white/10" />

      {/* COST BREAKDOWN */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-neutral-400">
          <span>{t.checkout.subtotal}</span>
          <span>€{(totalPrice / 100).toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-neutral-400">
          <span>{t.checkout.shipping}</span>
          <span className="text-green-400">{t.checkout.free}</span>
        </div>

        <div className="flex justify-between text-neutral-400">
          <span>{t.checkout.taxes}</span>
          <span>{t.checkout.included}</span>
        </div>
      </div>

      {/* TOTAL */}
      <div className="flex items-center justify-between border-t border-white/10 pt-4">
        <span className="text-base font-semibold">{t.checkout.total}</span>
        <span className="text-xl font-bold">€{(totalPrice / 100).toFixed(2)}</span>
      </div>

      <Button
        type="submit"
        form="checkout-form"
        disabled={!isValid || loading}
        className="h-12 w-full rounded-xl border border-white/20 !bg-white font-semibold !text-black shadow-md transition-all duration-200 hover:!bg-neutral-100 hover:shadow-lg hover:shadow-white/10 active:scale-[0.99]"
      >
        {loading ? t.checkout.processing : `${t.checkout.pay} €${(totalPrice / 100).toFixed(2)}`}
      </Button>

      {/* TRUST / UX BOOST */}
      <div className="mt-20 space-y-1 text-xs text-neutral-500">
        <p>🔒 {t.checkout.securePayment}</p>
        <p>💳 {t.checkout.stripe}</p>
        <p>🚚 {t.checkout.fastShipping}</p>
      </div>
    </div>
  );
}
