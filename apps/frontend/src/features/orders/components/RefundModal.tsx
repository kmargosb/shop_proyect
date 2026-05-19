import { X } from "lucide-react";

import { useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/shared/lib/api";
import type { Order } from "@/types/order";


type Props = {
  open: boolean;
  order: any;
  refundItems: Record<string, number>;
  processingRefund: boolean;
  refundError: string | null;
  refundSuccess: boolean;

  onClose: () => void;
  onConfirm: () => void;

  setRefundItems: React.Dispatch<
    React.SetStateAction<Record<string, number>>
  >;
};

export default function RefundModal({
  order,
  onClose,
  onSuccess,
}: {
  order: Order;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const [selectedItems, setSelectedItems] = useState<Record<string, number>>(
    {},
  );

  const processRefund = async () => {
    try {
      setLoading(true);

      const items = Object.entries(selectedItems)
        .filter(([, quantity]) => quantity > 0)
        .map(([orderItemId, quantity]) => ({
          orderItemId,
          quantity,
        }));

      if (items.length === 0) {
        toast.error("Selecciona productos");
        return;
      }

      const res = await apiFetch("/refunds", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          orderId: order.id,
          items,
          reason: "CUSTOMER_RETURN",
        }),
      });

      if (!res || !res.ok) {
        throw new Error();
      }

      toast.success("Refund procesado");

      await onSuccess();

      onClose();
    } catch {
      toast.error("Error procesando refund");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-neutral-950 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Procesar refund</h2>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-neutral-500 hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {order.items?.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-white/10 p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-white">
                    {item.product?.name ?? item.productName}
                  </p>

                  <p className="text-sm text-neutral-500">
                    Comprado: {item.quantity}
                  </p>
                </div>

                <select
                  value={selectedItems[item.id] ?? 0}
                  onChange={(e) =>
                    setSelectedItems((prev) => ({
                      ...prev,
                      [item.id]: Number(e.target.value),
                    }))
                  }
                  className="dashboard-input w-24"
                >
                  {Array.from({
                    length: item.quantity + 1,
                  }).map((_, index) => (
                    <option key={index} value={index}>
                      {index}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="w-full rounded-2xl border border-white/10 px-4 py-3 text-white"
          >
            Cancelar
          </button>

          <button
            onClick={processRefund}
            disabled={loading}
            className="w-full rounded-2xl bg-rose-300 px-4 py-3 font-semibold text-black disabled:opacity-50"
          >
            {loading ? "Procesando..." : "Procesar refund"}
          </button>
        </div>
      </div>
    </div>
  );
}