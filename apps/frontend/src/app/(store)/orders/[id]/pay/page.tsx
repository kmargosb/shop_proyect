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
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-semibold">
            Sesión de pago no válida
          </h1>

          <p className="text-neutral-400">
            No se encontró información de pago para este pedido.
          </p>

          <a
            href="/shop"
            className="underline text-neutral-400 hover:text-white"
          >
            Volver a la tienda
          </a>
        </div>
      </div>
    );
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/orders/${id}`,
    {
      cache: "no-store",
    },
  );

  if (!res.ok) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-semibold">
            Sesión de pago expirada
          </h1>

          <p className="text-neutral-400">
            Este pedido ya no puede ser pagado o la sesión ha expirado.
          </p>

          <a
            href="/shop"
            className="underline text-neutral-400 hover:text-white"
          >
            Volver a la tienda
          </a>
        </div>
      </div>
    );
  }

  const order = await res.json();

  if (
    [
      "CANCELLED",
      "FAILED",
      "REFUNDED",
      "DELIVERED",
    ].includes(order.status)
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-semibold">
            Esta sesión ya no es válida
          </h1>

          <p className="text-neutral-400">
            El pedido ya no puede ser pagado.
          </p>

          <a
            href="/shop"
            className="underline text-neutral-400 hover:text-white"
          >
            Volver a la tienda
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