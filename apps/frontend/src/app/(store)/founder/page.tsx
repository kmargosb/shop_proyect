import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Founder',
  description:
    'Meet the founder behind Camarguette and learn about the vision, design philosophy and technical craftsmanship behind the brand.',
};

export default function FounderPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-24 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="inline-flex rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs tracking-[0.3em] text-neutral-400 uppercase">
          Founder
        </div>

        <h1 className="mt-8 text-5xl font-bold tracking-tight md:text-7xl">
          Nelson E. Camargo Ríos.
        </h1>

        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-neutral-400">
          Fullstack developer focused on building premium digital experiences, modern ecommerce
          platforms and scalable systems with a minimalist approach.
        </p>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm text-neutral-500">Frontend</p>

            <h2 className="mt-3 text-xl font-semibold">Next.js & TypeScript</h2>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm text-neutral-500">Backend</p>

            <h2 className="mt-3 text-xl font-semibold">Express & Prisma</h2>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm text-neutral-500">Payments</p>

            <h2 className="mt-3 text-xl font-semibold">Stripe Systems</h2>
          </div>
        </div>

        <div className="mt-20 border-t border-white/10 pt-10">
          <p className="text-sm tracking-[0.3em] text-neutral-500 uppercase">Contact</p>

          <p className="mt-4 text-lg text-neutral-300">
            Available for selected freelance and ecommerce projects.
          </p>

          <p className="mt-6 text-neutral-500">contact@camarguette.com</p>
        </div>
      </div>
    </main>
  );
}
