"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import type { Order } from "../AccountPage";

type Props = {
  orders: Order[];
};
const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  PAYMENT_PROCESSING: "Procesando",
  PAID: "Pagado",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
  FAILED: "Fallido",
  PARTIALLY_REFUNDED: "Reembolso parcial",
  REFUNDED: "Reembolsado",
};

export default function OrdersTab({ orders }: Props) {
  const [page, setPage] = useState(1);

  const ITEMS_PER_PAGE = 6;

  const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);

  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;

    return orders.slice(start, start + ITEMS_PER_PAGE);
  }, [orders, page]);

  return (
    <div className="flex h-full flex-col rounded-3xl border border-white/10 bg-neutral-950 p-6 overflow-hidden">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">My Orders</h2>

        <p className="mt-2 text-sm text-neutral-500">
          Complete order and payment history.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-white/10 p-10 text-center">
          <p className="text-neutral-400">You have no orders yet</p>

          <Link
            href="/shop"
            className="mt-4 inline-flex rounded-xl bg-white px-4 py-2 text-sm font-medium text-black"
          >
            Go to the store
          </Link>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-1 premium-scrollbar">
          <div className="grid gap-4">
            {paginatedOrders.map((order) => {
              const totalProducts = order.items.reduce(
                (sum, item) => sum + item.quantity,
                0,
              );

              const previewImages = order.items
                .map((item) => {
                  const images = item.product?.images;

                  if (!images?.length) return undefined;

                  return (
                    images.find((img: any) => img.isPrimary)?.url ??
                    images[0]?.url
                  );
                })
                .filter((image): image is string => Boolean(image))
                .slice(0, 3);

              return (
                <div
                  key={order.id}
                  className="
        group
        rounded-3xl
        border border-white/10
        bg-gradient-to-b from-white/[0.03] to-transparent
        p-4
        transition-all duration-300
        hover:border-white/20
        hover:bg-white/[0.04]
      "
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    {/* LEFT */}

                    <div className="min-w-0 flex-1">
                      {/* IMAGES */}

                      {previewImages.length > 0 && (
                        <div className="mb-3 flex items-center">
                          {previewImages.map((image, index) => (
                            <div
                              key={image + index}
                              className="
                    relative
                    -ml-2 first:ml-0
                    h-16 w-16 overflow-hidden
                    rounded-2xl
                    border border-white/10
                    bg-neutral-900
                  "
                            >
                              <img
                                src={image}
                                alt=""
                                className="
                      h-full w-full object-cover
                      transition-transform duration-300
                      group-hover:scale-110
                    "
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                        Pedido
                      </p>

                      <h3 className="mt-1 text-xl font-semibold text-white">
                        #{order.id.slice(0, 6)}
                      </h3>
                      <div className="mt-3 space-y-1">
                        {order.items.slice(0, 2).map((item) => (
                          <p
                            key={item.id}
                            className="truncate text-sm text-neutral-400"
                          >
                            {item.product?.name}

                            {(item.color || item.size) && (
                              <>
                                {" "}
                                · {item.color}
                                {item.color && item.size ? " · " : ""}
                                {item.size}
                              </>
                            )}
                          </p>
                        ))}

                        {order.items.length > 2 && (
                          <p className="text-xs text-neutral-500">
                            +{order.items.length - 2} productos más
                          </p>
                        )}
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-neutral-500">
                        <span>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>

                        <span className="text-neutral-700">•</span>

                        <span>
                          {totalProducts}{" "}
                          {totalProducts === 1 ? "producto" : "productos"}
                        </span>
                      </div>
                    </div>

                    {/* RIGHT */}

                    <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end shrink-0">
                      <span
                        className={`rounded-full px-2 py-1 text-[11px] sm:px-3 sm:text-xs font-semibold ${
                          order.status === "PAID"
                            ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                            : order.status === "SHIPPED"
                              ? "border border-amber-500/20 bg-amber-500/10 text-amber-300"
                              : order.status === "REFUNDED"
                                ? "border border-cyan-500/20 bg-cyan-500/10 text-cyan-300"
                                : order.status === "PARTIALLY_REFUNDED"
                                  ? "border border-orange-500/20 bg-orange-500/10 text-orange-300"
                                  : order.status === "CANCELLED"
                                    ? "border border-red-500/20 bg-red-500/10 text-red-300"
                                    : "border border-white/10 bg-white/[0.04] text-neutral-300"
                        }`}
                      >
                        {statusLabels[order.status] ?? order.status}
                      </span>

                      <div className="text-right">
                        <p className="text-xs text-neutral-500">Total</p>

                        <p className="text-2xl font-bold text-white">
                          €{(order.totalAmount / 100).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}

                  <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                    <p className="text-xs text-neutral-600">
                      Gracias por tu compra
                    </p>

                    <Link
                      href={`/orders/${order.id}`}
                      className="
            inline-flex items-center gap-2
            text-sm font-medium text-white
            transition-all duration-200
            group-hover:translate-x-1
          "
                    >
                      Ver detalles →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2 border-t border-white/10 pt-6">
          <button
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white transition hover:bg-white/10 disabled:opacity-30"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex items-center gap-2">
            {Array.from({
              length: Math.min(3, totalPages),
            }).map((_, index) => {
              let currentPage;

              if (page <= 2) {
                currentPage = index + 1;
              } else if (page >= totalPages - 1) {
                currentPage = totalPages - 2 + index;
              } else {
                currentPage = page - 1 + index;
              }

              if (currentPage < 1 || currentPage > totalPages) {
                return null;
              }

              return (
                <button
                  key={currentPage}
                  onClick={() => setPage(currentPage)}
                  className={`h-10 min-w-[40px] rounded-xl px-3 text-sm font-medium transition ${
                    page === currentPage
                      ? "bg-white text-black"
                      : "border border-white/10 bg-white/[0.03] text-white hover:bg-white/10"
                  }`}
                >
                  {currentPage}
                </button>
              );
            })}

            {totalPages > 3 && !(page >= totalPages - 1) && (
              <>
                <span className="px-1 text-neutral-500">...</span>

                <button
                  onClick={() => setPage(totalPages)}
                  className={`h-10 min-w-[40px] rounded-xl px-3 text-sm font-medium transition ${
                    page === totalPages
                      ? "bg-white text-black"
                      : "border border-white/10 bg-white/[0.03] text-white hover:bg-white/10"
                  }`}
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white transition hover:bg-white/10 disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
