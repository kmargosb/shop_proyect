"use client";

import { useState } from "react";
import { useCart } from "@/features/cart/CartContext";
import { apiFetch } from "@/shared/lib/api";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

export default function CreateOrderForm() {
  const { items, clearCart, totalPrice } = useCart();

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) return;

    setLoading(true);

    try {
      const cartId = localStorage.getItem("cartId");

      if (!cartId) {
        throw new Error("Cart not found");
      }

      const res = await apiFetch(`/cart/${cartId}/checkout`, {
        method: "POST",
        body: JSON.stringify({
          cartId, // ✅ AÑADIR
          method: "CARD", // ✅ AÑADIR

          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          addressLine1: form.addressLine1,
          city: form.city,
          postalCode: form.postalCode,
          country: form.country,
        }),
      });

      if (!res || !res.ok) {
        throw new Error("Checkout failed");
      }

      const data = await res.json();

      console.log("🔥 CHECKOUT RESPONSE:", data); // 👈 AQUÍ

      /* =========================
         🔥 NEW BACKEND RESPONSE
      ========================= */

      const orderId = data?.orderId;
      const clientSecret = data?.payment?.clientSecret;

      if (!orderId || !clientSecret) {
        console.error("Invalid checkout response:", data);
        throw new Error("Invalid checkout response");
      }

      /* =========================
         SAVE DATA
      ========================= */

      localStorage.setItem("orderEmail", form.email);
      localStorage.setItem("lastOrderId", orderId);

      clearCart();

      /* =========================
         🔥 REDIRECT TO PAYMENT
      ========================= */

      window.location.href = `/orders/${orderId}/pay?clientSecret=${clientSecret}`;
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Error creando pedido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-10">
      <form onSubmit={handleSubmit} className="space-y-4">
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

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Procesando pedido..." : "Confirmar pedido"}
        </Button>
      </form>

      <div className="bg-neutral-900 p-6 rounded-xl">
        <h2 className="font-bold mb-4">Resumen del pedido</h2>

        {items.map((item) => (
          <div key={item.id} className="flex justify-between mb-2">
            <span>
              {item.name} × {item.quantity}
            </span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}

        <hr className="my-4 border-neutral-700" />

        <p className="text-xl font-bold">Total: ${totalPrice.toFixed(2)}</p>
      </div>
    </div>
  );
}
