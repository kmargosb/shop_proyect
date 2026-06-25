import Section from '../../../../shared/ui/Section';
import MediaFrame from './MediaFrame';

export default function FounderEnding() {
  return (
    <Section>
      <div className="mx-auto max-w-6xl">
        <MediaFrame aspect="aspect-[16/7]" />

        <div className="mx-auto mt-24 max-w-4xl text-center">
          <p className="text-xs tracking-[0.35em] text-neutral-500 uppercase">Camarguette</p>

          <h2 className="mt-8 text-5xl leading-tight font-bold md:text-7xl">Join us.</h2>

          <p className="mx-auto mt-10 max-w-3xl text-xl leading-9 text-neutral-300">
            Camarguette is more than products.
            <br />
            It's a place where creators, artists and developers build something meaningful together.
          </p>

          <p className="mt-14 text-2xl font-light text-white">
            Let's build something that truly lasts.
          </p>
        </div>
      </div>
    </Section>
  );
}
