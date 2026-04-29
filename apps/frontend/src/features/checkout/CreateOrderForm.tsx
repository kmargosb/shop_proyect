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

  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  const [isLogged, setIsLogged] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    postalCode: "",
    country: "ES",
  });

  /* =======================================================
     AUTOFILL (LOCAL STORAGE)
  ======================================================= */
  useEffect(() => {
    const saved = localStorage.getItem("checkoutData");

    if (saved) {
      try {
        setForm(JSON.parse(saved));
      } catch {
        localStorage.removeItem("checkoutData");
      }
    }
  }, []);

  /* =======================================================
     CHECK AUTH
  ======================================================= */
  useEffect(() => {
    const checkAuth = async () => {
      const res = await apiFetch("/auth/me");

      if (res && res.ok) {
        setIsLogged(true);
      }
    };

    checkAuth();
  }, []);

  /* =======================================================
     LOAD ADDRESSES + USER
  ======================================================= */
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const meRes = await apiFetch("/auth/me");

        if (!meRes || !meRes.ok) return;

        const meData = await meRes.json();

        const res = await apiFetch("/customers/me/addresses");

        if (!res || !res.ok) return;

        const data = await res.json();

        setAddresses(data);

        if (data.length > 0) {
          const first = data[0];

          setSelectedAddressId(first.id);

          setForm((prev) => ({
            ...prev,
            email: meData.user?.email || prev.email,
            fullName: first.fullName,
            phone: first.phone,
            addressLine1: first.addressLine1,
            addressLine2: first.addressLine2 || "",
            city: first.city,
            postalCode: first.postalCode,
            country: first.country,
          }));
        } else {
          setForm((prev) => ({
            ...prev,
            email: meData.user?.email || prev.email,
          }));
        }
      } catch (e) {
        console.error("Error loading addresses", e);
      }
    };

    loadAddresses();
  }, []);

  /* =======================================================
     AUTO SAVE
  ======================================================= */
  useEffect(() => {
    localStorage.setItem("checkoutData", JSON.stringify(form));
  }, [form]);

  /* =======================================================
     INPUT HANDLER
  ======================================================= */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /* =======================================================
     VALIDATION
  ======================================================= */
  const isValid =
    form.fullName &&
    form.email &&
    form.phone &&
    form.addressLine1 &&
    form.city &&
    form.postalCode;

  /* =======================================================
     SUBMIT
  ======================================================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      alert("Completa todos los campos");
      return;
    }

    if (items.length === 0) return;

    setLoading(true);

    try {
      const cartId = localStorage.getItem("cartId");

      if (!cartId) throw new Error("Cart not found");

      const res = await apiFetch(`/cart/${cartId}/checkout`, {
        method: "POST",
        body: JSON.stringify({
          cartId,
          method: "CARD",
          ...form,
        }),
      });

      if (!res || !res.ok) throw new Error("Checkout failed");

      const data = await res.json();

      const orderId = data?.orderId;
      const clientSecret = data?.payment?.clientSecret;

      if (!orderId || !clientSecret) {
        throw new Error("Invalid checkout response");
      }

      localStorage.setItem("orderEmail", form.email);
      localStorage.setItem("lastOrderId", orderId);

      clearCart();

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

      {/* LEFT SIDE */}
      <div className="space-y-6">

        {/* SAVED ADDRESSES */}
        {addresses.length > 0 && (
          <div className="bg-neutral-900 p-4 rounded-xl space-y-3">
            <h3 className="text-sm text-neutral-400">
              Direcciones guardadas
            </h3>

            {addresses.map((addr) => (
              <div
                key={addr.id}
                onClick={() => {
                  setSelectedAddressId(addr.id);

                  setForm((prev) => ({
                    ...prev,
                    fullName: addr.fullName,
                    phone: addr.phone,
                    addressLine1: addr.addressLine1,
                    addressLine2: addr.addressLine2 || "",
                    city: addr.city,
                    postalCode: addr.postalCode,
                    country: addr.country,
                  }));
                }}
                className={`p-3 rounded-lg cursor-pointer border ${
                  selectedAddressId === addr.id
                    ? "border-white"
                    : "border-white/10"
                }`}
              >
                <p className="text-sm font-medium">{addr.fullName}</p>
                <p className="text-xs text-neutral-400">
                  {addr.addressLine1} {addr.addressLine2}
                </p>
                <p className="text-xs text-neutral-400">
                  {addr.city}, {addr.postalCode}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {!isLogged && (
            <p className="text-sm text-neutral-400">
              ¿Tienes cuenta?{" "}
              <a
                href="/login?redirect=/checkout"
                className="underline hover:text-white"
              >
                Inicia sesión
              </a>
            </p>
          )}

          <Input name="fullName" placeholder="Nombre completo" required value={form.fullName} onChange={handleChange} />
          <Input name="email" type="email" placeholder="Email" required value={form.email} onChange={handleChange} />
          <Input name="phone" placeholder="Teléfono" required value={form.phone} onChange={handleChange} />

          <Input name="addressLine1" placeholder="Dirección" required value={form.addressLine1} onChange={handleChange} />
          <Input name="addressLine2" placeholder="Dirección adicional (opcional)" value={form.addressLine2} onChange={handleChange} />

          <Input name="city" placeholder="Ciudad" required value={form.city} onChange={handleChange} />
          <Input name="postalCode" placeholder="Código postal" required value={form.postalCode} onChange={handleChange} />

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

          <Button type="submit" className="w-full" disabled={loading || !isValid}>
            {loading ? "Procesando pedido..." : "Confirmar pedido"}
          </Button>
        </form>
      </div>

      {/* SUMMARY */}
      <div className="bg-neutral-900 p-6 rounded-xl">
        <h2 className="font-bold mb-4">Resumen del pedido</h2>

        {items.map((item) => (
          <div key={item.id} className="flex justify-between mb-2 text-sm">
            <span>
              {item.name} × {item.quantity}
            </span>
            <span>
              €{((item.price * item.quantity) / 100).toFixed(2)}
            </span>
          </div>
        ))}

        <hr className="my-4 border-neutral-700" />

        <p className="text-xl font-bold">
          Total: €{(totalPrice / 100).toFixed(2)}
        </p>
      </div>
    </div>
  );
}