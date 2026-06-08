"use client";

import { useState } from "react";
import { X, Save } from "lucide-react";
import { apiFetch } from "@/shared/lib/api";
import { toast } from "sonner";

type Props = {
  order: any;
  onClose: () => void;
  onSaved: () => Promise<void>;
};

export default function EditOrderModal({ order, onClose, onSaved }: Props) {
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    fullName: order.fullName || "",
    email: order.email || "",
    phone: order.phone || "",

    addressLine1: order.addressLine1 || "",
    addressLine2: order.addressLine2 || "",

    city: order.city || "",
    postalCode: order.postalCode || "",
    country: order.country || "",
  });

  const [items, setItems] = useState(
    order.items.map((item: any) => ({
      orderItemId: item.id,
      variantId: item.variantId,
      quantity: item.quantity,
    })),
  );

  const saveChanges = async () => {
    try {
      setSaving(true);

      const res = await apiFetch(`/orders/${order.id}/admin-edit`, {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          ...form,
          items,
        }),
      });

      if (!res || !res.ok) {
        throw new Error();
      }

      toast.success("Pedido actualizado correctamente");

      await onSaved();

      onClose();
    } catch {
      toast.error("No se pudo actualizar el pedido");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/10 bg-neutral-950 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
              Editor de pedido
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white">
              #{order.id.slice(0, 8).toUpperCase()}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-neutral-400 hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        {/* CLIENTE */}

        <div className="mt-8 rounded-3xl border border-white/10 p-5">
          <h3 className="font-semibold text-white">Cliente</h3>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <input
              value={form.fullName}
              onChange={(e) =>
                setForm({
                  ...form,
                  fullName: e.target.value,
                })
              }
              placeholder="Nombre"
              className="rounded-xl border border-white/10 bg-black px-4 py-3 text-white"
            />

            <input
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
              placeholder="Email"
              className="rounded-xl border border-white/10 bg-black px-4 py-3 text-white"
            />

            <input
              value={form.phone}
              onChange={(e) =>
                setForm({
                  ...form,
                  phone: e.target.value,
                })
              }
              placeholder="Teléfono"
              className="rounded-xl border border-white/10 bg-black px-4 py-3 text-white"
            />
          </div>
        </div>

        {/* DIRECCIÓN */}

        <div className="mt-6 rounded-3xl border border-white/10 p-5">
          <h3 className="font-semibold text-white">Dirección</h3>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <input
              value={form.addressLine1}
              onChange={(e) =>
                setForm({
                  ...form,
                  addressLine1: e.target.value,
                })
              }
              placeholder="Dirección"
              className="rounded-xl border border-white/10 bg-black px-4 py-3 text-white"
            />

            <input
              value={form.addressLine2}
              onChange={(e) =>
                setForm({
                  ...form,
                  addressLine2: e.target.value,
                })
              }
              placeholder="Piso / Apartamento"
              className="rounded-xl border border-white/10 bg-black px-4 py-3 text-white"
            />

            <input
              value={form.city}
              onChange={(e) =>
                setForm({
                  ...form,
                  city: e.target.value,
                })
              }
              placeholder="Ciudad"
              className="rounded-xl border border-white/10 bg-black px-4 py-3 text-white"
            />

            <input
              value={form.postalCode}
              onChange={(e) =>
                setForm({
                  ...form,
                  postalCode: e.target.value,
                })
              }
              placeholder="Código postal"
              className="rounded-xl border border-white/10 bg-black px-4 py-3 text-white"
            />
          </div>
        </div>

        {/* PRODUCTOS */}

        <div className="mt-6 rounded-3xl border border-white/10 p-5">
          <h3 className="font-semibold text-white">Productos</h3>

          <div className="mt-4 space-y-4">
            {order.items.map((item: any, index: number) => (
              <div
                key={item.id}
                className="rounded-2xl border border-white/10 p-4"
              >
                <p className="font-medium text-white">{item.productName}</p>

                <select
                  value={items[index].variantId}
                  onChange={(e) => {
                    const copy = [...items];

                    copy[index].variantId = e.target.value;

                    setItems(copy);
                  }}
                  className="mt-3 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white"
                >
                  {item.product.variants.map((variant: any) => (
                    <option
                      key={variant.id}
                      value={variant.id}
                      disabled={variant.stock <= 0}
                    >
                      {variant.size}
                      {" · "}
                      {variant.color} ({variant.stock})
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min={1}
                  value={items[index].quantity}
                  onChange={(e) => {
                    const copy = [...items];

                    copy[index].quantity = Number(e.target.value);

                    setItems(copy);
                  }}
                  className="mt-3 w-32 rounded-xl border border-white/10 bg-black px-4 py-3 text-white"
                />
              </div>
            ))}
          </div>
        </div>
        <button
          disabled={saving}
          onClick={saveChanges}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 font-semibold text-black"
        >
          <Save size={18} />
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}
