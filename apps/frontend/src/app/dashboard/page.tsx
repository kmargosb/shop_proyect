import AdminDashboard from "@/features/dashboard/components/AdminDashboard";
import AdminProducts from "@/features/products/components/AdminProducts";

export default function DashboardPage() {
  return (
    <div className="space-y-10">
      <AdminDashboard />
      <AdminProducts />
    </div>
  );
}