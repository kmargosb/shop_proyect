export default function FounderLife() {
  return (
    <section className="border-t border-white/10 py-28">
      <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr]">
        {/* LEFT */}

        <div>
          <p className="text-xs tracking-[0.35em] text-neutral-500 uppercase">
            Life Outside the Screen
          </p>

          <h2 className="mt-6 text-4xl leading-tight font-bold md:text-5xl">
            Creativity
            <br />
            doesn't stop
            <br />
            when I close VS Code.
          </h2>
        </div>

        {/* RIGHT */}

        <div>
          <p className="max-w-2xl text-lg leading-9 text-neutral-400">
            Skateboarding has been part of my life since 2001.
          </p>

          <p className="mt-8 max-w-2xl text-lg leading-9 text-neutral-400">
            It taught me patience, creativity, resilience and the value of trying something hundreds
            of times until it finally works.
          </p>

          <p className="mt-8 max-w-2xl text-lg leading-9 text-neutral-400">
            Those lessons shape the way I design products, write software and build Camarguette
            today.
          </p>

          <div className="mt-14 flex aspect-video items-center justify-center rounded-[32px] border border-dashed border-white/10 bg-white/[0.03]">
            <div className="text-center">
              <p className="tracking-[0.3em] text-neutral-500 uppercase">Skate Video</p>

              <p className="mt-2 text-neutral-600">Cinematic loop</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
