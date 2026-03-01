"use client";

import { useState } from "react";
import { useCart } from "@/features/cart/CartContext";
import { createOrder } from "@/features/orders/api/orders.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export default function CheckoutForm() {
  const { items, clearCart, totalPrice } = useCart();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    addressLine1: "",
    city: "",
    postalCode: "",
    country: "",
  });

  /* =========================
     INPUT CHANGE
  ========================= */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /* =========================
     SUBMIT ORDER
  ========================= */

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (items.length === 0) return;

    setLoading(true);

    try {
      const response = await createOrder({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        addressLine1: form.addressLine1,
        city: form.city,
        postalCode: form.postalCode,
        country: form.country,

        items: items.map((i) => ({
          productId: i.id,
          quantity: i.quantity,
        })),
      });

      console.log("✅ ORDER RESPONSE:", response);

      const orderId =
        response?.id ||
        response?.order?.id ||
        response?.data?.id;

      if (!orderId) {
        throw new Error("Order ID not received");
      }

      const redirectUrl = `/orders/${orderId}?email=${form.email}`;

      console.log("🚀 REDIRECTING TO:", redirectUrl);

      /**
       * IMPORTANTE:
       * primero navegar
       * luego limpiar carrito
       */
      window.location.href = redirectUrl;

      // limpiar después del redirect
      setTimeout(() => {
        clearCart();
      }, 200);

    } catch (err) {
      console.error("Checkout error:", err);
      alert("Error creando pedido");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     UI
  ========================= */

  return (
    <div className="grid md:grid-cols-2 gap-10">
      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <Input
          name="fullName"
          placeholder="Nombre completo"
          required
          onChange={handleChange}
        />

        <Input
          name="email"
          type="email"
          placeholder="Email"
          required
          onChange={handleChange}
        />

        <Input
          name="phone"
          placeholder="Teléfono"
          required
          onChange={handleChange}
        />

        <Input
          name="addressLine1"
          placeholder="Dirección"
          required
          onChange={handleChange}
        />

        <Input
          name="city"
          placeholder="Ciudad"
          required
          onChange={handleChange}
        />

        <Input
          name="postalCode"
          placeholder="Código postal"
          required
          onChange={handleChange}
        />

        <Input
          name="country"
          placeholder="País"
          required
          onChange={handleChange}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading
            ? "Procesando pedido..."
            : "Confirmar pedido"}
        </Button>
      </form>

      {/* ORDER SUMMARY */}
      <div className="bg-neutral-900 p-6 rounded-xl">
        <h2 className="font-bold mb-4">
          Resumen del pedido
        </h2>

        {items.map((item) => (
          <div
            key={item.id}
            className="flex justify-between mb-2"
          >
            <span>
              {item.name} × {item.quantity}
            </span>

            <span>
              ${(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}

        <hr className="my-4 border-neutral-700" />

        <p className="text-xl font-bold">
          Total: ${totalPrice.toFixed(2)}
        </p>
      </div>
    </div>
  );
}