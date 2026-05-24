export default function PrivacyPage() {
  return (
    <main className="h-[calc(100vh-72px)] overflow-hidden bg-black text-white">
      <div className="h-full overflow-y-auto premium-scrollbar px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="inline-flex rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs uppercase tracking-[0.3em] text-neutral-400">
            Privacy
          </div>

          <h1 className="mt-8 text-5xl font-bold tracking-tight md:text-7xl">
            Privacy policy
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-neutral-400">
            Your privacy matters. Camarguette is committed
            to protecting your personal information and
            providing a secure experience.
          </p>

          <div className="mt-16 space-y-12">
            <section>
              <h2 className="text-2xl font-semibold">
                Information
              </h2>

              <p className="mt-4 leading-relaxed text-neutral-400">
                We may collect information such as your
                name, email address, shipping details and
                payment-related data when using our
                platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">
                Usage
              </h2>

              <p className="mt-4 leading-relaxed text-neutral-400">
                Your information is used exclusively for
                order processing, support, analytics and
                improving the overall experience.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">
                Security
              </h2>

              <p className="mt-4 leading-relaxed text-neutral-400">
                Payments are securely processed through
                Stripe. Sensitive payment information is
                never stored directly on our servers.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}