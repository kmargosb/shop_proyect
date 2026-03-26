import PayOrderView from "@/features/payment/components/PayOrderView";

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
    <PayOrderView
      orderId={id}
      clientSecret={clientSecret}
    />
  );
}