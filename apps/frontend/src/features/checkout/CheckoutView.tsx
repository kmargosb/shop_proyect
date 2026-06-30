'use client';

import { useCart } from '@/features/cart/CartContext';
import CreateOrderForm from './CreateOrderForm';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/shared/i18n/LanguageContext';

export default function CheckoutView() {
  const { items, hydrated, cartBusy } = useCart();
  const router = useRouter();
  const { t } = useLanguage();

  const [checkedInitialCart, setCheckedInitialCart] = useState(false);

  useEffect(() => {
    if (!hydrated || cartBusy || checkedInitialCart) return;

    setCheckedInitialCart(true);

    if (items.length === 0) {
      router.replace('/shop');
    }
  }, [hydrated, cartBusy, checkedInitialCart, items.length, router]);

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white md:px-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-2xl font-bold md:text-3xl">{t.checkout.title}</h1>

        <CreateOrderForm />
      </div>
    </main>
  );
}
