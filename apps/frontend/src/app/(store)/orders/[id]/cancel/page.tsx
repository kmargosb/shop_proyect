"use client";

import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, ShieldCheck } from "lucide-react";
import { publicFetch } from "@/shared/lib/api";

export default function CancelOrderPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const id = params?.id as string;

  const [loading, setLoading] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  const handleCancel = async () => {
    try {
      setLoading(true);

      const email = searchParams.get("email");

      const response = await publicFetch(`/orders/public/${id}/cancel`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email,
        }),
      });

      if (!response?.ok) {
        throw new Error();
      }

      setCancelled(true);
    } catch (error) {
      console.error(error);

      alert("No hemos podido cancelar el pedido. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (cancelled) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12 md:py-20">
        <div className="rounded-[32px] border border-emerald-500/20 bg-emerald-500/10 p-8 md:p-12">
          <div className="flex justify-center">
            <ShieldCheck size={64} className="text-emerald-400" />
          </div>

          <h1 className="mt-6 text-center text-3xl font-semibold text-black md:text-4xl">
            Pedido cancelado correctamente
          </h1>

          <p className="mt-4 text-center leading-relaxed text-neutral-700">
            Hemos recibido tu solicitud y el pedido ha sido cancelado.
          </p>

          <p className="mt-3 text-center leading-relaxed text-neutral-500">
            Si el pago ya fue procesado, iniciaremos el reembolso lo antes
            posible.
          </p>

          <div className="mt-8 flex justify-center">
            <button
              onClick={() => router.push("/")}
              className="rounded-2xl bg-white px-6 py-4 font-medium text-black"
            >
              Volver a la tienda
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <div className="overflow-hidden rounded-[32px] border border-white/10 bg-neutral-950">
        <div className="grid lg:grid-cols-2">
          <div className="flex flex-col justify-center p-8 md:p-12">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-300">
              <AlertTriangle size={16} />
              Cancelación de pedido
            </div>

            <h1 className="mt-6 text-4xl font-semibold text-white md:text-5xl">
              ¿Seguro que deseas cancelar tu pedido?
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-neutral-400">
              Antes de continuar queremos asegurarnos de que esta es realmente
              la mejor opción para ti.
            </p>

            <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <p className="font-medium text-white">
                Qué ocurrirá al cancelar:
              </p>

              <ul className="mt-4 space-y-3 text-sm text-neutral-400">
                <li>• Tu pedido dejará de procesarse inmediatamente.</li>

                <li>• No podremos enviarlo.</li>

                <li>
                  • Si el pago ya fue confirmado, iniciaremos el proceso de
                  reembolso.
                </li>

                <li>• Esta acción no podrá deshacerse posteriormente.</li>
              </ul>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 px-6 py-4 text-white"
              >
                <ArrowLeft size={18} />
                Mantener pedido
              </button>

              <button
                onClick={handleCancel}
                disabled={loading}
                className="rounded-2xl bg-red-600 px-6 py-4 font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Cancelando..." : "Cancelar pedido"}
              </button>
            </div>
          </div>

          <div className="min-h-[320px] lg:min-h-full">
            <img
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1600"
              alt="Cancelación de pedido"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
