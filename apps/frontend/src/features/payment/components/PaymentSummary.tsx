'use client';

import Image from 'next/image';

type Props = {
  order: any;
};

export default function PaymentSummary({ order }: Props) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
      <h2 className="text-xl font-semibold">Order Summary</h2>

      <div className="mt-6 space-y-4">
        {order.items.map((item: any) => {
          const image =
            item.product?.images?.find((i: any) => i.isPrimary)?.url ??
            item.product?.images?.[0]?.url ??
            '/placeholder-product.png';

          return (
            <div key={item.id} className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-neutral-900">
                  <Image
                    src={image}
                    alt={item.productName}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{item.productName}</p>

                  <p className="mt-1 text-xs text-neutral-500">
                    {item.size}
                    {item.size && item.color && ' · '}
                    {item.color}
                  </p>

                  <p className="mt-1 text-xs text-neutral-400">Qty {item.quantity}</p>
                </div>
              </div>

              <div className="text-sm font-semibold whitespace-nowrap">
                €{((item.price * item.quantity) / 100).toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="my-6 border-t border-white/10" />

      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-neutral-400">
          <span>Subtotal</span>

          <span>€{(order.totalAmount / 100).toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-neutral-400">
          <span>Shipping</span>

          <span className="text-green-400">Free</span>
        </div>

        <div className="flex justify-between text-neutral-400">
          <span>Taxes</span>

          <span>Included</span>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
        <span className="text-lg font-semibold">Total</span>

        <span className="text-2xl font-bold">€{(order.totalAmount / 100).toFixed(2)}</span>
      </div>

      <div className="mt-8 space-y-2 text-xs text-neutral-500">
        <p>🔒 Secure payment</p>
        <p>💳 Powered by Stripe</p>
        <p>🚚 Fast shipping</p>
      </div>
    </div>
  );
}
