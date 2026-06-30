import PayOrderView from '@/features/payment/components/PayOrderView';

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    clientSecret?: string;
  }>;
}) {
  const { id } = await params;
  const { clientSecret } = await searchParams;

  return <PayOrderView orderId={id} clientSecret={clientSecret ?? null} />;
}
