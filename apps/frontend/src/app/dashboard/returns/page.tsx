"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/shared/lib/api";
import type { Order } from "@/types/order";
import StatusBadge from "@/features/orders/components/StatusBadge";

export default function ReturnsPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    (async () => {
      const res = await apiFetch("/orders?limit=100");
      const json = await res?.json();
      setOrders(Array.isArray(json?.data) ? json.data : []);
    })();
  }, []);

  const rows = useMemo(() => orders.flatMap((order) =>
    (order.refunds ?? []).map((refund) => ({ order, refund }))), [orders]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-white">Returns management</h1>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.map(({ order, refund }) => (
          <div key={refund.id} className="rounded-2xl border border-white/10 bg-neutral-950 p-4">
            <div className="flex items-center justify-between"><p className="text-sm text-neutral-400">#{order.id.slice(0,8)}</p><StatusBadge status={refund.status} /></div>
            <p className="mt-2 text-white">{order.fullName}</p>
            <p className="text-sm text-neutral-400">{order.email}</p>
            <p className="mt-2 text-sm text-neutral-300">Reason: {refund.reason ?? "—"}</p>
            <p className="text-sm text-neutral-300">Amount: €{((refund.amount ?? 0)/100).toFixed(2)}</p>
            {refund.items?.map((ri) => {
              const oi = order.items.find((x) => x.id === ri.orderItemId);
              return <p key={ri.orderItemId} className="text-xs text-neutral-400">{oi?.product?.name ?? oi?.productName ?? ri.orderItemId}: {ri.quantity} / {oi?.quantity ?? 0}</p>;
            })}
            {refund.evidence?.length ? <div className="mt-2 grid grid-cols-4 gap-2">{refund.evidence.map((ev,i)=><img key={i} src={ev.url} className="h-12 w-full rounded object-cover" alt="evidence"/> )}</div>:null}
          </div>
        ))}
      </div>
    </div>
  );
}
