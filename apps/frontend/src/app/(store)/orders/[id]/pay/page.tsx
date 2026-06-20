import PayOrderView from "@/features/payment/components/PayOrderView";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    clientSecret?: string;
    email?: string;
  }>;
}) {
  const { id } = await params;
  const { clientSecret, email } = await searchParams;

  if (!clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-semibold">Sesión de pago no válida</h1>

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
    `${process.env.NEXT_PUBLIC_API_URL}/orders/${id}?email=${encodeURIComponent(
      email || "",
    )}`,
    {
      cache: "no-store",
    },
  );

  if (!res.ok) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-semibold">Sesión de pago expirada</h1>

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

  if (["CANCELLED", "FAILED", "REFUNDED", "DELIVERED"].includes(order.status)) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="max-w-2xl text-center">
          <div className="mb-6 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-neutral-300">
            Pedido expirado
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Tu reserva ha expirado
          </h1>

          <p className="mt-6 text-lg text-neutral-400 leading-relaxed">
            Los productos ya no están reservados y su disponibilidad puede haber
            cambiado.
          </p>

          <p className="mt-3 text-neutral-500">
            Si todavía estás interesado, puedes volver a la tienda y realizar un
            nuevo pedido.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/shop"
              className="
            rounded-2xl
            bg-white
            px-8
            py-4
            text-black
            font-medium
            transition
            hover:bg-neutral-200
          "
            >
              Explorar tienda
            </a>

            <a
              href="/brands"
              className="
            rounded-2xl
            border
            border-white/10
            px-8
            py-4
            text-white
            transition
            hover:bg-white/5
          "
            >
              Descubrir marcas
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <PayOrderView orderId={id} clientSecret={clientSecret} />;
}
