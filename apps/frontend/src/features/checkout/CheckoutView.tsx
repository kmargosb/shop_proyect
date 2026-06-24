'use client';

import { useCart } from '@/features/cart/CartContext';
import CreateOrderForm from './CreateOrderForm';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/shared/i18n/LanguageContext';

export default function CheckoutView() {
  const { items } = useCart();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const { t } = useLanguage();

  /* =======================================================
     WAIT STORE HYDRATION (FIX REAL)
  ======================================================= */
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 150); // 🔥 clave para evitar redirect prematuro

    return () => clearTimeout(timer);
  }, []);

  /* =======================================================
     PROTECT EMPTY CART
  ======================================================= */
  useEffect(() => {
    if (isReady && items.length === 0) {
      router.replace('/shop');
    }
  }, [isReady, items, router]);

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white md:px-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-2xl font-bold md:text-3xl">{t.checkout.title}</h1>

        <CreateOrderForm />
      </div>
    </main>
  );
}
