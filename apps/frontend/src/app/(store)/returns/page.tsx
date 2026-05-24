export default function ReturnsPage() {
  return (
    <main className="h-[calc(100vh-72px)] overflow-hidden bg-black text-white">
      <div className="h-full overflow-y-auto premium-scrollbar px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="inline-flex rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs uppercase tracking-[0.3em] text-neutral-400">
            Returns
          </div>

          <h1 className="mt-8 text-5xl font-bold tracking-tight md:text-7xl">
            Returns & refunds
          </h1>

          <div className="mt-14 space-y-10">
            <section>
              <h2 className="text-2xl font-semibold">Return requests</h2>

              <p className="mt-4 leading-relaxed text-neutral-400">
                Return requests can be submitted directly from your order page
                after delivery.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">Review process</h2>

              <p className="mt-4 leading-relaxed text-neutral-400">
                Every request is manually reviewed before approval to ensure a
                fair process.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">Refunds</h2>

              <p className="mt-4 leading-relaxed text-neutral-400">
                Approved refunds are processed back through the original payment
                method.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
