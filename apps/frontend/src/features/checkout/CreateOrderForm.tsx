"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/features/cart/CartContext";
import { useAuth } from "@/features/auth/context/AuthContext";
import { apiFetch } from "@/shared/lib/api";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { COUNTRIES } from "@/shared/constants/countries";
import LoginInline from "@/features/auth/components/LoginInline";
import AddressAutocomplete from "./components/AddressAutocomplete";
import { toast } from "sonner";

/* ================= TYPES ================= */

type Address = {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
};

type AddressData = {
  addressLine1: string;
  city: string;
  postalCode: string;
  country: string;
};

type CheckoutResponse = {
  orderId: string;
  payment: { clientSecret: string };
};

export default function CreateOrderForm() {
  const { items, clearCart, totalPrice } = useCart();
  const { refreshUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );

  const [isLogged, setIsLogged] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

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

  /* ================= AUTOFILL ================= */

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

  /* ================= LOAD USER + ADDRESSES ================= */

  const loadAddresses = async () => {
    try {
      const meRes = await apiFetch("/auth/me");

      if (!meRes || !meRes.ok) {
        setIsLogged(false);
        return;
      }

      setIsLogged(true);

      const meData = await meRes.json();

      const res = await apiFetch("/customers/me/addresses");
      if (!res || !res.ok) return;

      const data: Address[] = await res.json();
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
      console.error(e);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  /* ================= AUTO SAVE ================= */

  useEffect(() => {
    localStorage.setItem("checkoutData", JSON.stringify(form));
  }, [form]);

  /* ================= INPUT ================= */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ================= ADDRESS AUTOCOMPLETE ================= */

  const handleAddressChange = (data: AddressData) => {
    setForm((prev) => ({
      ...prev,
      ...data,
    }));
  };

  /* ================= ADDRESS ACTIONS ================= */

  const deleteAddress = async (id: string) => {
    await apiFetch(`/customers/me/addresses/${id}`, {
      method: "DELETE",
    });

    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const setFavorite = async (id: string) => {
    await apiFetch(`/customers/me/addresses/${id}/favorite`, {
      method: "PATCH",
    });

    loadAddresses();
  };

  /* ================= VALID ================= */

  const isValid =
    form.fullName &&
    form.email &&
    form.phone &&
    form.addressLine1 &&
    form.city &&
    form.postalCode;

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) return alert("Completa todos los campos");

    setLoading(true);

    try {
      const cartId = localStorage.getItem("cartId");
      if (!cartId) throw new Error();

      const res = await apiFetch(`/cart/${cartId}/checkout`, {
        method: "POST",
        body: JSON.stringify({
          cartId,
          method: "CARD",
          ...form,
        }),
      });

      if (!res) {
        throw new Error("Error de conexión");
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null);

        throw new Error(data?.error || "Error al procesar checkout");
      }

      const data: CheckoutResponse = await res.json();

      clearCart();

      window.location.href = `/orders/${data.orderId}/pay?clientSecret=${data.payment.clientSecret}`;
    } catch (error: any) {
      toast.error(error?.message || "Error al procesar checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-10">
      {/* LEFT */}
      <div className="space-y-6">
        {/* LOGIN APPLE STYLE */}
        {!isLogged && (
          <div className="bg-neutral-900 rounded-xl overflow-hidden">
            <motion.div layout className="p-4">
              <AnimatePresence mode="wait">
                {!showLogin ? (
                  <motion.div
                    key="cta"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{
                      duration: 0.35,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <p className="text-sm text-neutral-400">
                      ¿Tienes cuenta?{" "}
                      <button
                        onClick={() => setShowLogin(true)}
                        className="underline hover:text-white transition"
                      >
                        Inicia sesión
                      </button>
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{
                      duration: 0.35,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <LoginInline
                      onSuccess={async () => {
                        await refreshUser();
                        setIsLogged(true);
                        await loadAddresses();
                        setShowLogin(false);
                      }}
                    />

                    <button
                      onClick={() => setShowLogin(false)}
                      className="mt-4 text-xs text-neutral-400 hover:text-white transition"
                    >
                      ← Volver
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}

        {/* ADDRESSES */}
        {addresses.length > 0 && (
          <div className="bg-neutral-900 p-4 rounded-xl space-y-3">
            <h3 className="text-sm text-neutral-400">Direcciones guardadas</h3>

            {addresses.map((addr) => {
              const selected = selectedAddressId === addr.id;

              return (
                <motion.div
                  key={addr.id}
                  layout
                  transition={{
                    duration: 0.35,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  onClick={() => {
                    setSelectedAddressId(addr.id);

                    setForm((prev) => ({
                      ...prev,
                      fullName: addr.fullName ?? "",
                      phone: addr.phone ?? "",
                      addressLine1: addr.addressLine1 ?? "",
                      addressLine2: addr.addressLine2 ?? "",
                      city: addr.city ?? "",
                      postalCode: addr.postalCode ?? "",
                      country: addr.country ?? "ES",
                    }));
                  }}
                  className={`relative pl-10 pr-4 p-4 rounded-xl border cursor-pointer
                  ${
                    selected
                      ? "border-white bg-white/5 shadow-[0_0_20px_rgba(255,255,255,0.08)]"
                      : "border-white/10 hover:border-white/30"
                  }`}
                >
                  <motion.div
                    layout
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border"
                    animate={{
                      backgroundColor: selected
                        ? "#ffffff"
                        : "rgba(255,255,255,0)",
                      borderColor: selected ? "#fff" : "rgba(255,255,255,0.4)",
                    }}
                  />

                  <div className="flex justify-between">
                    <p className="font-medium">{addr.fullName}</p>

                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFavorite(addr.id);
                        }}
                      >
                        {addr.isDefault ? "⭐" : "☆"}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteAddress(addr.id);
                        }}
                      >
                        🗑
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-400 mt-1">
                    {addr.addressLine1}
                  </p>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Nombre completo"
          />
          <Input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
          />
          <Input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Teléfono"
          />

          <AddressAutocomplete
            value={form.addressLine1}
            onChange={handleAddressChange}
          />

          <Input
            name="addressLine2"
            value={form.addressLine2}
            onChange={handleChange}
            placeholder="Piso / puerta"
          />
          <Input
            name="city"
            value={form.city}
            onChange={handleChange}
            placeholder="Ciudad"
          />
          <Input
            name="postalCode"
            value={form.postalCode}
            onChange={handleChange}
            placeholder="Código postal"
          />

          <select
            name="country"
            value={form.country}
            onChange={handleChange}
            className="w-full p-3 bg-neutral-900 border border-neutral-700 rounded-lg"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>

          <Button
            disabled={!isValid || loading}
            className="w-full h-12 text-base"
          >
            {loading ? "Procesando..." : "Confirmar pedido"}
          </Button>
        </form>
      </div>

      {/* RIGHT */}
      <div className="bg-neutral-900 p-6 rounded-2xl border border-white/10 sticky top-6 space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Resumen</h2>
          <span className="text-xs text-neutral-400">
            {items.length} {items.length === 1 ? "artículo" : "artículos"}
          </span>
        </div>

        {/* ITEMS */}
        <div className="space-y-4 max-h-[300px] overflow-auto pr-1">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                {/* IMAGE  */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-neutral-800">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-500">
                      IMG
                    </div>
                  )}
                </div>

                {/* INFO */}
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-xs text-neutral-400">
                    Cantidad: {item.quantity}
                  </span>
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
            <span>Subtotal</span>
            <span>€{(totalPrice / 100).toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-neutral-400">
            <span>Envío</span>
            <span className="text-green-400">Gratis</span>
          </div>

          <div className="flex justify-between text-neutral-400">
            <span>Impuestos</span>
            <span>Incluidos</span>
          </div>
        </div>

        {/* TOTAL */}
        <div className="border-t border-white/10 pt-4 flex justify-between items-center">
          <span className="text-base font-semibold">Total</span>
          <span className="text-xl font-bold">
            €{(totalPrice / 100).toFixed(2)}
          </span>
        </div>

        {/* TRUST / UX BOOST */}
        <div className="text-xs text-neutral-500 space-y-1">
          <p>🔒 Pago seguro con cifrado SSL</p>
          <p>💳 Procesado por Stripe</p>
        </div>
      </div>
    </div>
  );
}
