"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import type { Order } from "../AccountPage";

type Props = {
  orders: Order[];
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
        <h2 className="text-2xl font-bold">Mis pedidos</h2>

        <p className="mt-2 text-sm text-neutral-500">
          Historial completo de pedidos y pagos.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-white/10 p-10 text-center">
          <p className="text-neutral-400">No tienes pedidos todavía</p>

          <Link
            href="/shop"
            className="mt-4 inline-flex rounded-xl bg-white px-4 py-2 text-sm font-medium text-black"
          >
            Ir a la tienda
          </Link>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-1 premium-scrollbar">
          <div className="grid gap-4">
            {paginatedOrders.map((order) => (
              <div
                key={order.id}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b 
                from-white/[0.05] to-white/[0.02] p-5 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06]
                hover:shadow-[0_0_40px_rgba(255,255,255,0.03)] active:scale-[0.995]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-neutral-500">Pedido</p>

                    <p className="mt-1 font-semibold">
                      #{order.id.slice(0, 6)}
                    </p>
                  </div>

                  <span
                    className={`rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide ${
                      order.status === "PAID"
                        ? "border-green-500/20 bg-green-500/10 text-green-300"
                        : "border-yellow-500/20 bg-yellow-500/10 text-yellow-300"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <p className="text-sm text-neutral-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>

                  <p className="text-lg font-bold">
                    €{(order.totalAmount / 100).toFixed(2)}
                  </p>
                </div>

                <Link
                  href={`/orders/${order.id}`}
                  className="mt-5 inline-flex text-sm text-white underline underline-offset-4"
                >
                  Ver pedido
                </Link>
              </div>
            ))}
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
