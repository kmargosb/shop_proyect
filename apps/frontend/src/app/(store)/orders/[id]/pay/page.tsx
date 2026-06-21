import PayOrderView from "@/features/payment/components/PayOrderView";

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

  if (!clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-semibold">
            Invalid payment session
          </h1>

          <p className="text-neutral-400">
            No payment information was found for this order.
          </p>

          <a
            href="/shop"
            className="underline text-neutral-400 hover:text-white"
          >
            Return shopping
          </a>
        </div>
      </div>
    );
  }

  return (
    <PayOrderView
      orderId={id}
      clientSecret={clientSecret}
    />
  );
}