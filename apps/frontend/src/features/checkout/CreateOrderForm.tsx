"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useCart } from "@/features/cart/CartContext";
import { useAuth } from "@/features/auth/context/AuthContext";
import { apiFetch } from "@/shared/lib/api";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { COUNTRIES } from "@/shared/constants/countries";
import LoginInline from "@/features/auth/components/LoginInline";
import AddressAutocomplete from "./components/AddressAutocomplete";

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

export default function CreateOrderForm() {
  const { items, clearCart, totalPrice } = useCart();
  const { refreshUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

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
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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

      if (!res || !res.ok) throw new Error();

      const data: {
        orderId: string;
        payment: { clientSecret: string };
      } = await res.json();

      clearCart();

      window.location.href = `/orders/${data.orderId}/pay?clientSecret=${data.payment.clientSecret}`;
    } catch {
      alert("Error en checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-10">

      {/* LEFT */}
      <div className="space-y-6">

        {/* LOGIN */}
        {!isLogged && (
          <div className="bg-neutral-900 p-4 rounded-xl">
            {!showLogin ? (
              <p className="text-sm text-neutral-400">
                ¿Tienes cuenta?{" "}
                <button
                  onClick={() => setShowLogin(true)}
                  className="underline hover:text-white"
                >
                  Inicia sesión
                </button>
              </p>
            ) : (
              <LoginInline
                onSuccess={async () => {
                  await refreshUser();
                  setIsLogged(true);
                  await loadAddresses();
                  setShowLogin(false);
                }}
              />
            )}
          </div>
        )}

        {/* ADDRESSES */}
        {addresses.length > 0 && (
          <div className="bg-neutral-900 p-4 rounded-xl space-y-3">
            <h3 className="text-sm text-neutral-400">
              Direcciones guardadas
            </h3>

            {addresses.map((addr) => {
              const selected = selectedAddressId === addr.id;

              return (
                <motion.div
                  key={addr.id}
                  layout
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedAddressId(addr.id);

                    setForm((prev) => ({
                      ...prev,
                      ...addr,
                    }));
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition
                  ${
                    selected
                      ? "border-white bg-white/5"
                      : "border-white/10 hover:border-white/30"
                  }`}
                >
                  <div className="flex justify-between">
                    <p>{addr.fullName}</p>

                    <div className="flex gap-2">
                      <button onClick={(e) => {
                        e.stopPropagation();
                        setFavorite(addr.id);
                      }}>
                        ⭐
                      </button>

                      <button onClick={(e) => {
                        e.stopPropagation();
                        deleteAddress(addr.id);
                      }}>
                        🗑
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-400">
                    {addr.addressLine1}
                  </p>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">

          <Input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Nombre completo" />
          <Input name="email" value={form.email} onChange={handleChange} placeholder="Email" />
          <Input name="phone" value={form.phone} onChange={handleChange} placeholder="Teléfono" />

          {/* 🔥 SOLO ESTE INPUT */}
          <AddressAutocomplete
            value={form.addressLine1}
            onChange={handleAddressChange}
          />

          <Input name="addressLine2" value={form.addressLine2} onChange={handleChange} placeholder="Piso / puerta" />
          <Input name="city" value={form.city} onChange={handleChange} placeholder="Ciudad" />
          <Input name="postalCode" value={form.postalCode} onChange={handleChange} placeholder="Código postal" />

          <select name="country" value={form.country} onChange={handleChange} className="w-full p-3 bg-neutral-900 border border-neutral-700 rounded-lg">
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>

          <Button disabled={!isValid || loading} className="w-full">
            {loading ? "Procesando..." : "Confirmar pedido"}
          </Button>
        </form>
      </div>

      {/* RIGHT */}
      <div className="bg-neutral-900 p-6 rounded-xl">
        <h2 className="font-bold mb-4">Resumen</h2>

        {items.map((i) => (
          <div key={i.id} className="flex justify-between text-sm">
            <span>{i.name}</span>
            <span>€{((i.price * i.quantity) / 100).toFixed(2)}</span>
          </div>
        ))}

        <hr className="my-4 border-neutral-700" />

        <p className="text-xl font-bold">
          €{(totalPrice / 100).toFixed(2)}
        </p>
      </div>
    </div>
  );
}