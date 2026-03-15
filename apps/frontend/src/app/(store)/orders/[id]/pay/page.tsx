import PayOrderPage from "@/features/payment/pages/PayOrderPage";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <PayOrderPage orderId={id} />;
}