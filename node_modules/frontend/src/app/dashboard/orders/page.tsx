"use client"

import AdminOrders from "@/features/orders/components/AdminOrders"
import AdminDashboard from "@/features/dashboard/components/AdminDashboard"

export default function OrdersPage() {
  return (
  <main>
    <AdminDashboard/>
    <AdminOrders />
  </main>)
}