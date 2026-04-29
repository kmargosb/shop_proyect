"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/features/cart/CartContext";
import { apiFetch } from "@/shared/lib/api";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { COUNTRIES } from "@/shared/constants/countries";

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
    country: "ES",
  });

  /* =========================
     AUTOFILL (UX PRO)
  ========================= */

  useEffect(() => {
    const saved = localStorage.getItem("checkoutData");

    if (saved) {
      setForm(JSON.parse(saved));
    }
  }, []);

  /* =========================
     AUTO SAVE
  ========================= */

  useEffect(() => {
    localStorage.setItem("checkoutData", JSON.stringify(form));
  }, [form]);

  /* =========================
     INPUT HANDLER
  ========================= */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /* =========================
     SUBMIT
  ========================= */

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
          cartId,
          method: "CARD",
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          addressLine1: form.addressLine1,
          city: form.city,
          postalCode: form.postalCode,
          country: form.country, // 🔥 ahora es CODE (ES)
        }),
      });

      if (!res || !res.ok) {
        throw new Error("Checkout failed");
      }

      const data = await res.json();

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
         REDIRECT
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
      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-4">

        <Input
          name="fullName"
          placeholder="Nombre completo"
          required
          value={form.fullName}
          onChange={handleChange}
        />

        <Input
          name="email"
          type="email"
          placeholder="Email"
          required
          value={form.email}
          onChange={handleChange}
        />

        <Input
          name="phone"
          placeholder="Teléfono"
          required
          value={form.phone}
          onChange={handleChange}
        />

        <Input
          name="addressLine1"
          placeholder="Dirección"
          required
          value={form.addressLine1}
          onChange={handleChange}
        />

        <Input
          name="city"
          placeholder="Ciudad"
          required
          value={form.city}
          onChange={handleChange}
        />

        <Input
          name="postalCode"
          placeholder="Código postal"
          required
          value={form.postalCode}
          onChange={handleChange}
        />

        {/* 🔥 COUNTRY SELECT PRO */}
        <select
          name="country"
          value={form.country}
          onChange={handleChange}
          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-sm"
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Procesando pedido..." : "Confirmar pedido"}
        </Button>
      </form>

      {/* RESUMEN */}
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

        <p className="text-xl font-bold">
          Total: ${totalPrice.toFixed(2)}
        </p>
      </div>
    </div>
  );
}