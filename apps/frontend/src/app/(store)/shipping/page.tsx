export default function ShippingPage() {
  return (
    <main className="h-[calc(100vh-72px)] overflow-hidden bg-black text-white">
  <div className="h-full overflow-y-auto premium-scrollbar px-6 py-16">
    <div className="mx-auto max-w-3xl">
        <div className="inline-flex rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs uppercase tracking-[0.3em] text-neutral-400">
          Shipping
        </div>

        <h1 className="mt-8 text-5xl font-bold tracking-tight md:text-7xl">
          Shipping information
        </h1>

        <div className="mt-14 space-y-10">
          <section>
            <h2 className="text-2xl font-semibold">
              Processing
            </h2>

            <p className="mt-4 leading-relaxed text-neutral-400">
              Orders are usually processed within 1–3
              business days after payment confirmation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">
              Delivery
            </h2>

            <p className="mt-4 leading-relaxed text-neutral-400">
              Shipping times may vary depending on your
              location and carrier availability.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">
              Tracking
            </h2>

            <p className="mt-4 leading-relaxed text-neutral-400">
              Once your order ships, tracking information
              will be provided directly in your account.
            </p>
          </section>
        </div>
      </div>
      </div>
    </main>
  );
}