import Section from '../../../../shared/ui/Section';
import MediaFrame from './MediaFrame';

export default function WhoIAmSection() {
  return (
    <Section>
      <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-xs tracking-[0.35em] text-neutral-500 uppercase">Who I Am</p>

          <h2 className="mt-6 text-4xl leading-tight font-bold md:text-5xl">
            Builder.
            <br />
            Developer.
            <br />
            Skater.
          </h2>
        </div>

        <div>
          <p className="max-w-2xl text-lg leading-9 text-neutral-400">
            I'm a full-stack developer passionate about building products that combine technology,
            design and storytelling.
          </p>

          <p className="mt-8 max-w-2xl text-lg leading-9 text-neutral-400">
            Camarguette is where everything I've learned throughout my life comes together into one
            vision.
          </p>

          <div className="mt-16 grid grid-cols-2 gap-5">
            <MediaFrame aspect="aspect-[4/5]" />

            <MediaFrame aspect="aspect-[4/5]" />

            <MediaFrame aspect="aspect-video" />

            <MediaFrame aspect="aspect-video" />
          </div>
        </div>
      </div>
    </Section>
  );
}
