"use client";

import Link from "next/link";
import type { Order } from "../AccountPage";

type Props = {
  orders: Order[];
};

export default function OrdersTab({ orders }: Props) {
  return (
    <div className="rounded-3xl border border-white/10 bg-neutral-950 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Mis pedidos</h2>

        <p className="mt-2 text-sm text-neutral-500">
          Historial completo de pedidos y pagos.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-white/10 p-10 text-center">
          <p className="text-neutral-400">
            No tienes pedidos todavía
          </p>

          <Link
            href="/shop"
            className="mt-4 inline-flex rounded-xl bg-white px-4 py-2 text-sm font-medium text-black"
          >
            Ir a la tienda
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-white/10 bg-black/40 p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-neutral-500">Pedido</p>

                  <p className="mt-1 font-semibold">
                    #{order.id.slice(0, 6)}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs ${
                    order.status === "PAID"
                      ? "bg-green-500/20 text-green-300"
                      : "bg-yellow-500/20 text-yellow-300"
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
      )}
    </div>
  );
}