import { UserRound, LucideIcon } from 'lucide-react';
import type { Order } from '@/types/order';

export function safeNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

export function formatMoney(cents: number) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(safeNumber(cents) / 100);
}

export function CustomerPreview({ order }: { order: Order }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-black">
        <UserRound size={17} />
      </div>
      <div className="min-w-0">
        <p className="truncate font-medium text-white">
          {order.shippingFullName || 'Cliente sin nombre'}
        </p>
        <p className="truncate text-xs text-neutral-500">{order.email || 'Sin email'}</p>
      </div>
    </div>
  );
}

export function OrderTimeline({ status }: { status: string }) {
  const steps = ['PENDING', 'PAID', 'SHIPPED'];
  const current =
    status === 'FAILED' || status === 'REFUNDED' ? 1 : Math.max(0, steps.indexOf(status));
  return (
    <div className="flex items-center gap-1">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center gap-1">
          <span
            className={`h-2.5 w-2.5 rounded-full ${index <= current ? 'bg-emerald-300' : 'bg-white/15'}`}
          />
          {index < steps.length - 1 && (
            <span className={`h-px w-7 ${index < current ? 'bg-emerald-300' : 'bg-white/15'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export function ActionTile({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-center text-neutral-500">
      <Icon className="mx-auto" size={18} />
      <p className="mt-2 text-xs font-semibold">{label} ready</p>
    </div>
  );
}
