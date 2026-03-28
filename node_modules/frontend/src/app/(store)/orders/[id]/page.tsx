"use client";

import { useAuth } from "@/hooks/useAuth";
import PublicOrderPage from "@/features/orders/PublicOrderPage";
import OrderDetailPage from "@/features/orders/OrderDetailPage";

export default function Page() {
  const { isAuthenticated } = useAuth();

  // 🔥 SI está logueado → experiencia PRO
  if (isAuthenticated) {
    return <OrderDetailPage />;
  }

  // 🔥 SI NO → sistema antiguo (guest)
  return <PublicOrderPage />;
}