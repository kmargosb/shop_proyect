export default function TermsPage() {
  return (
    <main className="h-[calc(100vh-72px)] overflow-hidden bg-black text-white">
      <div className="h-full overflow-y-auto premium-scrollbar px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="inline-flex rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs uppercase tracking-[0.3em] text-neutral-400">
            Terms
          </div>

          <h1 className="mt-8 text-5xl font-bold tracking-tight md:text-7xl">
            Terms of service
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-neutral-400">
            By accessing and using Camarguette, you agree
            to the following terms and conditions.
          </p>

          <div className="mt-16 space-y-12">
            <section>
              <h2 className="text-2xl font-semibold">
                Orders
              </h2>

              <p className="mt-4 leading-relaxed text-neutral-400">
                All orders are subject to product
                availability and payment confirmation.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">
                Returns & refunds
              </h2>

              <p className="mt-4 leading-relaxed text-neutral-400">
                Refund requests are reviewed manually and
                processed according to our returns policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">
                Intellectual property
              </h2>

              <p className="mt-4 leading-relaxed text-neutral-400">
                All branding, content and digital assets
                remain property of Camarguette unless
                otherwise stated.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}