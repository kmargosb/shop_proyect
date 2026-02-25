"use client";

import type { Order } from "@/types/order";

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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-gray-900 w-full max-w-2xl rounded-2xl p-6 border border-gray-800 shadow-2xl">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            Orden {formatOrderNumber(order.id)}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        {/* INFO CLIENTE */}
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
            {order.addressLine1}, {order.addressLine2 || ""}, {order.city},{" "}
            {order.postalCode}, {order.country}
          </p>
          <p>
            <span className="text-gray-400">Estado:</span>{" "}
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
          </p>
          <p>
            <span className="text-gray-400">Fecha:</span>{" "}
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        {/* ITEMS */}
        {order.items.map((item) => (
          <div key={item.id} className="bg-gray-800 p-4 rounded-lg space-y-1">
            <p className="font-semibold">{item.product.name}</p>

            <div className="flex justify-between text-sm text-gray-400">
              <span>
                {item.quantity} x ${item.price}
              </span>

              <span>${(item.quantity * item.price).toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
