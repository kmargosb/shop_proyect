import PayOrderPage from "@/features/payment/pages/PayOrderPage";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ clientSecret?: string }>;
}) {
  const { id } = await params;
  const { clientSecret } = await searchParams;

  if (!clientSecret) {
    return <div>Error: missing payment data</div>;
  }

  return (
    <PayOrderPage
      orderId={id}
      clientSecret={clientSecret}
    />
  );
}