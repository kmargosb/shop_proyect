"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { LifeBuoy, Send, Phone } from "lucide-react";
import { apiFetch, publicFetch } from "@/shared/lib/api";

export default function OrderHelpPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const id = params?.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!id) return;

    const loadOrder = async () => {
      try {
        const email =
          searchParams.get("email") || localStorage.getItem("orderEmail");

        /* GUEST */

        if (email) {
          const response = await publicFetch(
            `/orders/public/${id}?email=${encodeURIComponent(email)}`,
          );

          setOrder(await response.json());

          return;
        }

        /* AUTH USER */

        const response = await apiFetch(`/orders/${id}`);

        if (response?.ok) {
          setOrder(await response.json());
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id, searchParams]);

  const handleSubmit = async () => {
    if (!message.trim()) {
      alert("Por favor escribe un mensaje.");
      return;
    }

    try {
      setSending(true);

      const response = await apiFetch(`/orders/${id}/help-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message.trim(),
          phone: phone.trim(),
        }),
      });

      if (!response?.ok) {
        throw new Error();
      }

      setSent(true);
      setMessage("");
    } catch (error) {
      console.error(error);

      alert("No hemos podido enviar tu mensaje. Inténtalo de nuevo.");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20">
        <p className="text-center text-neutral-500">Cargando pedido...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20">
        <p className="text-center text-neutral-500">Pedido no encontrado.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-6">
      {/* HERO */}

      <div className="relative overflow-hidden rounded-3xl border border-white/10">
        <img
          src="https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=1800"
          alt="Customer support"
          className="h-[240px] w-full object-cover md:h-[320px]"
        />

        <div className="absolute inset-0 bg-black/60" />

        <div className="absolute inset-0 flex items-center">
          <div className="px-6 md:px-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur">
              <LifeBuoy size={16} />
              Atención personalizada
            </div>

            <h1 className="mt-5 max-w-2xl text-3xl font-semibold text-white md:text-5xl">
              ¿Tienes un problema con tu pedido?
            </h1>

            <p className="mt-3 text-white">
              Si ha habido un problema con la talla, color, producto, dirección
              o cualquier otro detalle, explícanoslo aquí.
            </p>
          </div>
        </div>
      </div>

      {/* CONTENT */}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* FORM */}

        <div className="rounded-3xl border border-white/10 bg-neutral-950 p-6 md:p-8">
          {!sent ? (
            <>
              <h2 className="text-2xl font-semibold text-white">
                Cuéntanos qué ha ocurrido
              </h2>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={7}
                placeholder="Explícanos brevemente qué ha ocurrido con tu pedido..."
                className="mt-6 w-full resize-none rounded-3xl border border-white/10 bg-black px-5 py-4 text-white outline-none placeholder:text-neutral-600"
              />

              <div className="relative mt-4">
                <Phone
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500"
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Otro teléfono de contacto (opcional)"
                  className="w-full rounded-2xl border border-white/10 bg-black py-4 pl-12 pr-4 text-white outline-none placeholder:text-neutral-600"
                />
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-wider text-neutral-500">
                  Te responderemos en
                </p>

                <p className="mt-1 text-white break-all">{order.email}</p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={sending}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 font-medium text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send size={18} />

                {sending ? "Enviando..." : "Enviar mensaje"}
              </button>
            </>
          ) : (
            <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6">
              <h2 className="text-2xl font-semibold text-emerald-300">
                Hemos recibido tu mensaje
              </h2>

              <p className="mt-4 leading-relaxed text-neutral-300">
                Gracias por escribirnos. Revisaremos tu caso personalmente y te
                responderemos por correo electrónico lo antes posible.
              </p>
            </div>
          )}
        </div>

        {/* ORDER SUMMARY */}

        <div className="rounded-3xl border border-white/10 bg-neutral-950 p-6">
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
            Resumen del pedido
          </p>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs text-neutral-500">Pedido</p>

            <p className="mt-1 font-medium text-white">
              #{order.id.slice(0, 8)}
            </p>

            <p className="mt-4 text-xs text-neutral-500">Cliente</p>

            <p className="mt-1 text-white">{order.fullName}</p>

            <p className="mt-4 text-xs text-neutral-500">Email</p>

            <p className="mt-1 break-all text-white">{order.email}</p>
            <p className="mt-4 text-xs text-neutral-500">Dirección de envío</p>

            <div className="mt-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm text-white">{order.addressLine1}</p>

              {order.addressLine2 && (
                <p className="mt-1 text-sm text-white">{order.addressLine2}</p>
              )}

              <p className="mt-1 text-sm text-neutral-300">
                {order.postalCode} {order.city}
              </p>

              <p className="mt-1 text-sm text-neutral-300">{order.country}</p>
              <p className="mt-4 text-xs text-neutral-500">
                Teléfono del pedido
              </p>

              <p className="mt-1 text-white">{order.phone}</p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {order.items?.map((item: any) => (
              <div
                key={item.id}
                className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                <img
                  src={
                    item.product?.images?.find((img: any) => img.isPrimary)
                      ?.url ||
                    item.product?.images?.[0]?.url ||
                    "/placeholder-product.jpg"
                  }
                  alt={item.productName || item.product?.name}
                  className="h-20 w-20 rounded-xl object-cover"
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-white">
                    {item.productName || item.product?.name}
                  </p>

                  <p className="mt-1 text-sm text-neutral-400">
                    {item.size} · {item.color}
                  </p>

                  <p className="mt-1 text-sm text-neutral-500">
                    Cantidad: {item.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Total</span>

              <span className="font-semibold text-white">
                €{(order.totalAmount / 100).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
