"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { LifeBuoy, Send, Phone } from "lucide-react";
import { apiFetch, publicFetch } from "@/shared/lib/api";
import { socket } from "@/shared/lib/socket";

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
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [processingRefund, setProcessingRefund] = useState(false);
  const [refundError, setRefundError] = useState<string | null>(null);
  const [refundSuccess, setRefundSuccess] = useState(false);
  const [refundItems, setRefundItems] = useState<Record<string, number>>({});
  const [refundReason, setRefundReason] = useState("CUSTOMER_RETURN");
  const [refundComment, setRefundComment] = useState("");
  const [refundImages, setRefundImages] = useState<File[]>([]);
  const [refundPreviews, setRefundPreviews] = useState<string[]>([]);

  useEffect(() => {
  if (!id) return;

  const handleOrderUpdate = (data: any) => {
    if (data.orderId === id) {
      loadOrder();
    }
  };

  socket.on("orderUpdated", handleOrderUpdate);

  return () => {
    socket.off("orderUpdated", handleOrderUpdate);
  };
}, [id]);

  useEffect(() => {
    if (!id) return;

    loadOrder();
  }, [id, searchParams]);

  const loadOrder = async () => {
    try {
      const queryEmail = searchParams.get("email");

      const storedOrderId = localStorage.getItem("orderEmailOrderId");

      const storedEmail = localStorage.getItem("orderEmail");

      const email = queryEmail || (storedOrderId === id ? storedEmail : null);

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

  useEffect(() => {
    if (showRefundModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [showRefundModal]);

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

  const handleRefund = async () => {
    try {
      setProcessingRefund(true);

      setRefundError(null);

      const items = order.items
        .filter((item: any) => (refundItems[item.id] || 0) > 0)
        .map((item: any) => ({
          orderItemId: item.id,
          quantity: refundItems[item.id],
        }));

      if (items.length === 0) {
        setRefundError("Selecciona al menos un producto");
        return;
      }

      if (refundComment.trim().length < 20) {
        setRefundError("Describe el motivo con al menos 20 caracteres");

        return;
      }
      const formData = new FormData();

      formData.append("orderId", order.id);
      formData.append("items", JSON.stringify(items));
      formData.append("reason", refundReason);
      formData.append("note", refundComment);

      for (const image of refundImages) {
        formData.append("images", image);
      }

      const res = await apiFetch("/refunds", {
        method: "POST",
        body: formData,
      });

      const data = await res?.json();

      if (!res || !res.ok) {
        setRefundError(data?.message || "No se pudo procesar");
        return;
      }

      setRefundSuccess(true);

      setTimeout(async () => {
        await loadOrder();

        setShowRefundModal(false);
        setRefundSuccess(false);
        setRefundItems({});
        setRefundComment("");
        setRefundImages([]);
        setRefundPreviews([]);
      }, 1200);
    } catch (error) {
      console.error(error);

      setRefundError("Error inesperado");
    } finally {
      setProcessingRefund(false);
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

  const canRequestRefund =
  ["DELIVERED", "PARTIALLY_REFUNDED"].includes(order.status);

  const hasRefundableItems =
    order.items?.some((item: any) => {
      const refundedQuantity =
  order.refunds
    ?.flatMap((refund: any) => refund.items || [])
          .filter((ri: any) => ri.orderItemId === item.id)
          .reduce((sum: number, ri: any) => sum + ri.quantity, 0) || 0;

      return refundedQuantity < item.quantity;
    }) ?? false;

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

        <div className="flex h-full flex-col rounded-3xl border border-white/10 bg-neutral-950 p-6 md:p-8">
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
          {canRequestRefund && hasRefundableItems && (
            <div className="mt-auto border-t border-white/10 pt-6">
              <p className="text-xs text-neutral-500">
                ¿No estás satisfecho con tu compra?
              </p>

              <button
                onClick={() => setShowRefundModal(true)}
                className="
                      mt-1
                      text-sm
                      text-neutral-300
                      underline
                      underline-offset-4
                      hover:text-white
                    "
              >
                Solicitar una devolución
              </button>
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
      {showRefundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-neutral-950 p-6 md:p-8">
            <h2 className="text-3xl font-semibold text-white">
              Solicitar devolución
            </h2>

            <p className="mt-2 text-sm text-neutral-500">
              Selecciona los productos que deseas devolver.
            </p>

            <div className="mt-6 space-y-4">
              {order.items
                .filter((item: any) => {
                  const refundedQuantity =
  order.refunds
    ?.flatMap((refund: any) => refund.items || [])
                      .filter((ri: any) => ri.orderItemId === item.id)
                      .reduce((sum: number, ri: any) => sum + ri.quantity, 0) ||
                    0;

                  return refundedQuantity < item.quantity;
                })
                .map((item: any) => {
                  const refundedQuantity =
  order.refunds
    ?.flatMap((refund: any) => refund.items || [])
                      .filter((ri: any) => ri.orderItemId === item.id)
                      .reduce((sum: number, ri: any) => sum + ri.quantity, 0) ||
                    0;

                  const remainingQuantity = item.quantity - refundedQuantity;
                  console.log({
                    producto: item.product?.name,
                    quantity: item.quantity,
                    refundedQuantity,
                    remainingQuantity,
                  });

                  const selected = refundItems[item.id] || 0;

                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white">
                            {item.product?.name ?? item.productName}
                          </p>

                          <p className="mt-1 text-sm text-neutral-400">
                            {item.color} {item.size && `· ${item.size}`}
                          </p>

                          <p className="mt-1 text-sm text-neutral-500">
                            Cantidad disponible para devolución:{" "}
                            {remainingQuantity}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              setRefundItems((prev) => ({
                                ...prev,
                                [item.id]: Math.max(0, selected - 1),
                              }))
                            }
                            className="h-9 w-9 rounded-full border border-white/10"
                          >
                            -
                          </button>

                          <span className="w-6 text-center text-white">
                            {selected}
                          </span>

                          <button
                            onClick={() =>
                              setRefundItems((prev) => ({
                                ...prev,
                                [item.id]: Math.min(
                                  remainingQuantity,
                                  selected + 1,
                                ),
                              }))
                            }
                            className="h-9 w-9 rounded-full border border-white/10"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-sm text-neutral-400">
                Motivo
              </label>

              <select
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-white"
              >
                <option
                  value="CUSTOMER_RETURN"
                  className="bg-neutral-900 text-white"
                >
                  Ya no lo quiero
                </option>

                <option
                  value="WRONG_ITEM"
                  className="bg-neutral-900 text-white"
                >
                  Producto incorrecto
                </option>

                <option value="DAMAGED" className="bg-neutral-900 text-white">
                  Producto dañado
                </option>

                <option value="OTHER" className="bg-neutral-900 text-white">
                  Otro motivo
                </option>
              </select>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm text-neutral-400">
                Comentario
              </label>

              <textarea
                rows={4}
                value={refundComment}
                maxLength={300}
                onChange={(e) => setRefundComment(e.target.value)}
                placeholder="Explícanos qué ha ocurrido..."
                className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-white outline-none"
              />

              <p className="mt-2 text-right text-xs text-neutral-500">
                {refundComment.length}/300
              </p>
            </div>

            {/* FOTOS */}

            <div className="mt-5">
              <label className="mb-2 block text-sm text-neutral-400">
                Evidencias fotográficas (opcional)
              </label>

              <label
                htmlFor="refund-images"
                className="
      flex cursor-pointer items-center justify-center
      rounded-2xl border border-dashed border-white/15
      bg-white/[0.02]
      px-6 py-8
      text-center
      transition
      hover:border-white/30
      hover:bg-white/[0.04]
    "
              >
                <div>
                  <p className="text-sm text-white">
                    Arrastra imágenes o haz clic para subirlas
                  </p>

                  <p className="mt-1 text-xs text-neutral-500">
                    JPG, PNG, WEBP · Máximo 5 imágenes
                  </p>
                </div>
              </label>

              <input
                id="refund-images"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const newFiles = Array.from(e.target.files || []);

                  const mergedFiles = [...refundImages, ...newFiles].slice(
                    0,
                    5,
                  );

                  setRefundImages(mergedFiles);

                  setRefundPreviews(
                    mergedFiles.map((file) => URL.createObjectURL(file)),
                  );

                  e.target.value = "";
                }}
              />

              {refundPreviews.length > 0 && (
                <div className="mt-4">
                  <p className="mb-3 text-xs text-neutral-500">
                    {refundImages.length}/5 imágenes seleccionadas
                  </p>

                  <div className="mt-4">
                    <p className="mb-3 text-xs text-neutral-500">
                      {refundImages.length}/5 imágenes
                    </p>

                    <div className="grid grid-cols-5 gap-2">
                      {Array.from({ length: 5 }).map((_, slotIndex) => {
                        const preview = refundPreviews[slotIndex];

                        return (
                          <div
                            key={slotIndex}
                            className="
            group
    relative
    aspect-square
    overflow-hidden
    rounded-xl
    border border-white/10
    bg-white/[0.03]
    transition-all
    hover:border-white/30
    hover:shadow-lg
  "
                          >
                            {preview ? (
                              <>
                                <img
                                  src={preview}
                                  alt=""
                                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105 group-hover:brightness-75"
                                />

                                <button
                                  type="button"
                                  onClick={() => {
                                    setRefundImages((prev) =>
                                      prev.filter((_, i) => i !== slotIndex),
                                    );

                                    setRefundPreviews((prev) =>
                                      prev.filter((_, i) => i !== slotIndex),
                                    );
                                  }}
                                  className="
                                  absolute
                                  right-1.5
                                  top-1.5
                                  z-10
                                  flex
                                  h-6
                                  w-6
                                  items-center
                                  justify-center
                                  rounded-full
                                  border
                                  border-white/100
                                  shadow-lg
                                  bg-black/70
                                  backdrop-blur
                                  text-xs
                                  font-bold
                                  text-white
                                  opacity-100
                                  transition-all
                                  hover:scale-110
                                  hover:bg-red-500"
                                >
                                  ✕
                                </button>
                              </>
                            ) : (
                              <div className="flex h-full items-center justify-center text-neutral-600">
                                +
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {refundError && (
              <p className="mt-4 text-sm text-red-400">{refundError}</p>
            )}

            {refundSuccess && (
              <p className="mt-4 text-sm text-emerald-400">
                Solicitud enviada correctamente
              </p>
            )}

            <p className="mt-6 text-xs text-neutral-500">
              Las devoluciones pueden solicitarse dentro de los 21 días
              posteriores a la entrega.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
              <button
                onClick={() => setShowRefundModal(false)}
                className="w-full rounded-2xl border border-white/10 py-3 text-white"
              >
                Cancelar
              </button>

              <button
                onClick={handleRefund}
                disabled={processingRefund || refundComment.trim().length < 20}
                className="w-full rounded-2xl bg-white py-3 text-black disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processingRefund ? "Procesando..." : "Confirmar devolución"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
