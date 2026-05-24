export default function ContactPage() {
  return (
    <main className="h-[calc(100vh-72px)] overflow-hidden bg-black text-white">
      <div className="h-full overflow-y-auto premium-scrollbar px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="inline-flex rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs uppercase tracking-[0.3em] text-neutral-400">
            Contact
          </div>

          <h1 className="mt-8 text-5xl font-bold tracking-tight md:text-7xl">
            Let’s build something great.
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-neutral-400">
            For support, collaborations or selected digital projects, feel free
            to get in touch.
          </p>

          {/* CONTACT BLOCKS */}

          <div className="mt-16 grid gap-6">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <p className="text-sm text-neutral-500">Email</p>

              <p className="mt-3 text-xl font-semibold">
                contact@camarguette.com
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <p className="text-sm text-neutral-500">Availability</p>

              <p className="mt-3 text-xl font-semibold">
                Open for selected collaborations and ecommerce projects.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
