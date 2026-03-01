"use client";

import type { Order } from "@/types/order";
import { downloadInvoice } from "@/lib/api";

type Props = {
  order: Order;
  onClose: () => void;
};

const formatOrderNumber = (id: string) => {
  const short = id.replace(/-/g, "").slice(0, 6);
  return `#${short.toUpperCase()}`;
};

export default function OrderDetailModal({ order, onClose }: Props) {
  console.log("ORDER MODAL DATA:", order);
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 w-full max-w-2xl rounded-2xl p-6 border border-gray-800 shadow-2xl">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            Orden {formatOrderNumber(order.id)}
          </h2>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-lg"
          >
            ✕
          </button>
        </div>

        {/* CLIENT INFO */}
        <div className="space-y-2 text-sm mb-6">
          <p>
            <span className="text-gray-400">Cliente:</span> {order.fullName}
          </p>

          <p>
            <span className="text-gray-400">Email:</span> {order.email}
          </p>

          <p>
            <span className="text-gray-400">Teléfono:</span> {order.phone}
          </p>

          <p>
            <span className="text-gray-400">Dirección:</span>{" "}
            {order.addressLine1}, {order.addressLine2 ?? ""} {order.city},{" "}
            {order.postalCode}, {order.country}
          </p>

          {/* STATUS */}
          <div className="flex items-center gap-3">
            <span className="text-gray-400">Estado:</span>

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

          {/* INVOICE SECTION */}
          {order.invoice && (
            <div className="mt-4 bg-gray-800 border border-gray-700 rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-400">Factura</p>
                <p className="font-semibold">{order.invoice.invoiceNumber}</p>
              </div>

              <button
                onClick={() => downloadInvoice(order.id)}
                className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200"
              >
                Descargar PDF
              </button>
            </div>
          )}

          <p className="text-sm">
            <span className="text-gray-400">Fecha:</span>{" "}
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        {/* ITEMS */}
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="bg-gray-800 p-4 rounded-lg">
              <p className="font-semibold">{item.product.name}</p>

              <div className="flex justify-between text-sm text-gray-400">
                <span>
                  {item.quantity} × ${item.price}
                </span>

                <span>${(item.quantity * item.price).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* TOTAL */}
        <div className="mt-6 text-right font-bold text-lg">
          Total: ${order.total.toFixed(2)}
        </div>
      </div>
    </div>
  );
}
