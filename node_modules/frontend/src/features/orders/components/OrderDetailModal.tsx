"use client";

import type { Order } from "@/types/order";
import { downloadInvoice } from "@/shared/lib/api";
import { X } from "lucide-react";

type Props = {
  order: Order;
  onClose: () => void;
};

const formatOrderNumber = (id: string) => {
  const short = id.replace(/-/g, "").slice(0, 6);
  return `#${short.toUpperCase()}`;
};

export default function OrderDetailModal({ order, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
      {/* CONTAINER */}
      <div className="w-full h-full md:h-auto md:max-h-[90vh] md:max-w-2xl bg-[#111111] md:rounded-2xl border border-white/10 shadow-2xl flex flex-col">
        {/* HEADER (sticky 🔥) */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10 sticky top-0 bg-[#111111] z-10">
          <h2 className="text-lg md:text-xl font-semibold">
            Orden {formatOrderNumber(order.id)}
          </h2>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENT (scroll interno 🔥) */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {/* CLIENT INFO */}
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-neutral-500">Cliente:</span>{" "}
              {order.fullName}
            </p>

            <p>
              <span className="text-neutral-500">Email:</span> {order.email}
            </p>

            <p>
              <span className="text-neutral-500">Teléfono:</span> {order.phone}
            </p>

            <p>
              <span className="text-neutral-500">Dirección:</span>{" "}
              {order.addressLine1}, {order.addressLine2 ?? ""} {order.city},{" "}
              {order.postalCode}, {order.country}
            </p>

            {/* STATUS */}
            <div className="flex items-center gap-2">
              <span className="text-neutral-500">Estado:</span>

              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  order.status === "PENDING"
                    ? "bg-yellow-600"
                    : order.status === "PAID"
                      ? "bg-green-600"
                      : order.status === "SHIPPED"
                        ? "bg-purple-600"
                        : "bg-red-600"
                }`}
              >
                {order.status}
              </span>
            </div>

            <p className="text-xs text-neutral-500">
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>

          {/* INVOICE */}
          {order.invoice && (
            <div className="bg-white/[0.05] border border-white/[0.1] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-xs text-neutral-500">Factura</p>
                <p className="font-medium">{order.invoice.invoiceNumber}</p>
              </div>

              <button
                onClick={() => downloadInvoice(order.id)}
                className="bg-white text-black px-4 py-2 rounded-lg text-sm hover:opacity-90 transition"
              >
                Descargar PDF
              </button>
            </div>
          )}

          {/* ITEMS */}
          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{item.product.name}</p>

                  <p className="text-xs text-neutral-500">
                    {item.quantity} × €{(item.price / 100).toFixed(2)}
                  </p>
                </div>

                <p className="font-semibold">
                  €{((item.price * item.quantity) / 100).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER (sticky 🔥) */}
        <div className="border-t border-white/10 p-4 md:p-6 flex justify-between items-center">
          <span className="text-neutral-400 text-sm">Total</span>

          <span className="text-lg font-bold">
            €{(order.totalAmount / 100).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
