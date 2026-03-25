"use client";

import { useCart } from "@/features/cart/CartContext";
import CreateOrderForm from "./CreateOrderForm";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CheckoutPage() {
  const { items } = useCart();
  const router = useRouter();

  // evitar checkout vacío
  useEffect(() => {
    if (items.length === 0) {
      router.push("/");
    }
  }, [items, router]);

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <h1 className="text-3xl font-bold mb-8">
        Finalizar compra
      </h1>

      <CreateOrderForm />
    </main>
  );
}