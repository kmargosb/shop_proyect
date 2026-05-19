import { FileText, RotateCcw, Truck, X } from "lucide-react";

import type { Order } from "@/types/order";
import StatusBadge from "./StatusBadge";
import { formatMoney, CustomerPreview, OrderTimeline, ActionTile } from "./order-ui";


type Props = {
  order: Order;
  onClose: () => void;
  onCreateShipment: () => void;
  onOpenRefund: () => void;
  onCancel: () => void;
};

export default function QuickViewModal({
  order,
  onClose,
  onCreateShipment,
  onOpenRefund,
  onCancel,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-t-3xl border border-white/10 bg-neutral-950 p-5 shadow-2xl sm:rounded-3xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
              Vista rápida
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Orden #{order.id.slice(0, 8)}
            </h2>
            <div className="mt-3">
              <StatusBadge status={order.status} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-neutral-500 hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
        <div className="mt-6 space-y-4">
          <CustomerPreview order={order} />
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <p className="font-semibold text-white">Timeline</p>
            <div className="mt-4">
              <OrderTimeline status={order.status} />
            </div>
            <p className="mt-3 text-sm text-neutral-500">
              Preparado para tracking de envío, factura y reembolsos.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <p className="font-semibold text-white">Productos</p>
            {order.items?.map((item) => (
              <div
                key={item.id}
                className="mt-3 flex flex-col gap-1 text-sm sm:flex-row sm:justify-between sm:gap-3"
              >
                <span className="text-neutral-300">
                  {item.product?.name ?? item.productName ?? item.productId}
                </span>
                <span className="text-neutral-500">
                  x{item.quantity} · {formatMoney(item.price)}
                </span>
              </div>
            ))}
          </div>
          <div className="grid gap-3 min-[420px]:grid-cols-3">
            <ActionTile icon={RotateCcw} label="Refund" />
            <ActionTile icon={Truck} label="Tracking" />
            <ActionTile icon={FileText} label="Invoice" />
          </div>
          {(order.status === "PAID" ||
            order.status === "PARTIALLY_REFUNDED") && (
            <button
              onClick={() => onOpenRefund()}
              className="w-full rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm font-semibold text-rose-200"
            >
              Procesar refund
            </button>
          )}

          {order.status === "PAID" && (
            <button
              onClick={onCreateShipment}
              className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black"
            >
              Crear envío + tracking
            </button>
          )}
          {order.status !== "SHIPPED" &&
            order.status !== "REFUNDED" &&
            order.status !== "CANCELLED" && (
              <button
                onClick={onCancel}
                className="w-full rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200"
              >
                Cancelar pedido
              </button>
            )}
        </div>
      </div>
    </div>
  );
}
