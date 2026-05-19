

import { useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/shared/lib/api";
import type { Order} from "@/types/order";

type Props = {
  order: Order;
  onClose: () => void;
  onSuccess: () => void;
};

export default function ShipmentModal({
  order,
  onClose,
  onSuccess,
}: Props) {
  const [carrier, setCarrier] = useState("");

  const [trackingNumber, setTrackingNumber] = useState("");

  const [loading, setLoading] = useState(false);

  const createShipment = async () => {
    try {
      setLoading(true);

      const res = await apiFetch("/shipping", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          orderId: order.id,
          carrier,
          trackingNumber,
        }),
      });

      if (!res || !res.ok) {
        throw new Error();
      }

      toast.success("Shipment creado");

      onSuccess();

      onClose();
    } catch {
      toast.error("Error creando shipment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-neutral-950 p-6">
        <h2 className="text-xl font-semibold text-white">Crear envío</h2>

        <div className="mt-6 space-y-4">
          <select
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            className="dashboard-input"
          >
            <option value="">Seleccionar carrier</option>

            <option value="Correos">Correos</option>

            <option value="Correos Express">Correos Express</option>

            <option value="SEUR">SEUR</option>

            <option value="MRW">MRW</option>

            <option value="DHL">DHL</option>
          </select>

          <input
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Tracking number"
            className="dashboard-input"
          />
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="w-full rounded-2xl border border-white/10 px-4 py-3 text-white"
          >
            Cancelar
          </button>

          <button
            onClick={createShipment}
            disabled={loading || !carrier || !trackingNumber}
            className="w-full rounded-2xl bg-white px-4 py-3 font-semibold text-black disabled:opacity-50"
          >
            {loading ? "Creando..." : "Crear envío"}
          </button>
        </div>
      </div>
    </div>
  );
}