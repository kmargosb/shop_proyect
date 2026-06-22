export default function CookiesPage() {
  return (
    <main className="h-[calc(100vh-72px)] overflow-hidden bg-black text-white">
      <div className="premium-scrollbar h-full overflow-y-auto px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="inline-flex rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs tracking-[0.3em] text-neutral-400 uppercase">
            Cookies
          </div>

          <h1 className="mt-8 text-5xl font-bold tracking-tight md:text-7xl">Cookie policy</h1>

          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-neutral-400">
            Camarguette uses cookies and similar technologies to improve the user experience,
            remember preferences and analyze website usage.
          </p>

          <div className="mt-16 space-y-12">
            <section>
              <h2 className="text-2xl font-semibold">Essential cookies</h2>

              <p className="mt-4 leading-relaxed text-neutral-400">
                Required for core functionality such as authentication, shopping cart and checkout.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">Analytics</h2>

              <p className="mt-4 leading-relaxed text-neutral-400">
                Anonymous analytics may be used to understand website performance and improve the
                customer experience.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">Third-party services</h2>

              <p className="mt-4 leading-relaxed text-neutral-400">
                Services such as Stripe and authentication providers may place cookies required for
                secure operation.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
