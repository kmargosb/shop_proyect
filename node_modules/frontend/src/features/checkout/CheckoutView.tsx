"use client";

import { useCart } from "@/features/cart/CartContext";
import CreateOrderForm from "./CreateOrderForm";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CheckoutView() {
  const { items } = useCart();
  const router = useRouter();

  const [isReady, setIsReady] = useState(false);

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
      router.push("/");
    }
  }, [isReady, items, router]);

  return (
    <main className="min-h-screen bg-black text-white px-4 md:px-10 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-8">
          Finalizar compra
        </h1>

        <CreateOrderForm />
      </div>
    </main>
  );
}