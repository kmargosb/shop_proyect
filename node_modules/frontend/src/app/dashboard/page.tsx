import AdminProducts from "@/features/products/components/AdminProducts";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Revenue", value: "€12,430" },
          { label: "Orders", value: "320" },
          { label: "Customers", value: "89" },
          { label: "Conversion", value: "3.2%" },
        ].map((card, i) => (
          <div
            key={i}
            className="bg-neutral-900 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition"
          >
            <p className="text-sm text-neutral-400">{card.label}</p>
            <p className="text-2xl font-bold mt-2">{card.value}</p>
          </div>
        ))}
      </div>

      {/* PRODUCTS */}
      <AdminProducts />
    </div>
  );
}