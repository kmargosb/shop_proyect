type Props = {
  status: string;
};

export default function StatusBadge({
  status,
}: Props) {
  const map: Record<string, string> = {
    PENDING: "border-amber-400/20 bg-amber-400/10 text-amber-200",
    PAYMENT_PROCESSING: "border-sky-400/20 bg-sky-400/10 text-sky-200",
    PAID: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
    SHIPPED: "border-indigo-400/20 bg-indigo-400/10 text-indigo-200",
    REFUNDED: "border-rose-400/20 bg-rose-400/10 text-rose-200",
    PARTIALLY_REFUNDED: "border-orange-400/20 bg-orange-400/10 text-orange-200",
    FAILED: "border-red-400/20 bg-red-400/10 text-red-200",
    CANCELLED: "border-neutral-400/20 bg-neutral-400/10 text-neutral-200",
  };
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${map[status] ?? map.PENDING}`}
    >
      {status.toLowerCase().replaceAll("_", " ")}
    </span>
  );
}