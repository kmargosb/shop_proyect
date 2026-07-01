import Link from 'next/link';

export default function ContactInfo() {
  return (
    <section className="mt-14 space-y-5">
      {/* EMAIL */}

      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-sm tracking-[0.2em] text-neutral-500 uppercase">Email</p>

        <Link
          href="mailto:contact@camarguette.com"
          className="mt-3 block text-lg font-semibold text-white transition hover:text-neutral-300"
        >
          contact@camarguette.com
        </Link>
      </div>

      {/* RESPONSE */}

      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-sm tracking-[0.2em] text-neutral-500 uppercase">Response time</p>

        <p className="mt-3 text-lg font-semibold text-white">Usually within 24 hours.</p>
      </div>

      {/* AVAILABILITY */}

      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-sm tracking-[0.2em] text-neutral-500 uppercase">Availability</p>

        <p className="mt-3 text-lg leading-relaxed text-neutral-300">
          Open for selected collaborations, ecommerce projects and business partnerships.
        </p>
      </div>
    </section>
  );
}
