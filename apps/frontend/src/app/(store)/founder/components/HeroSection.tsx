import FounderHeroPhotos from './FounderHeroPhotos';

export default function HeroSection() {
  return (
    <section className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      {/* LEFT */}

      <div>
        <div className="inline-flex rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs tracking-[0.35em] text-neutral-500 uppercase">
          Founder
        </div>

        <h1 className="mt-8 text-5xl leading-[0.92] font-bold tracking-tight md:text-7xl xl:text-8xl">
          Nelson E.
          <br />
          Camargo Ríos.
        </h1>

        <p className="mt-10 max-w-xl text-2xl leading-relaxed text-neutral-200">
          I build digital products.
        </p>

        <p className="mt-2 max-w-xl text-2xl leading-relaxed text-neutral-200">
          Camarguette is my life's project.
        </p>

        <p className="mt-8 max-w-xl text-lg leading-8 text-neutral-400">
          For more than half of my life I've wanted to create something that truly belongs to me.
          Something that can outlive trends, inspire people and become a place where creators grow
          together.
        </p>

        <div className="mt-14 border-l border-white/10 pl-6">
          <p className="text-3xl leading-tight font-light md:text-4xl">
            "The future isn't someday.
          </p>

          <p className="text-3xl leading-tight font-light md:text-4xl">The future is now."</p>

          <p className="mt-6 text-neutral-500">
            There is no better moment to build what you truly believe in.
          </p>
        </div>
      </div>

      {/* RIGHT */}

      <FounderHeroPhotos />
    </section>
  );
}
