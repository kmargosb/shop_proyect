import Section from '../../../../shared/ui/Section';
import SectionTitle from '../../../../shared/ui/SectionTitle';
import MediaFrame from './MediaFrame';

export default function CamarguetteSection() {
  return (
    <Section className="mt-32 border-none pt-0">
      <SectionTitle eyebrow="Camarguette" title="A project built to last." />

      <div className="mt-14 grid gap-14 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-lg leading-9 text-neutral-300">
            For more than half of my life, I've had the need to create something that truly belongs
            to me.
          </p>

          <p className="mt-8 text-lg leading-9 text-neutral-400">
            Not another business. Not another ecommerce website. Not another brand following trends.
          </p>

          <p className="mt-8 text-lg leading-9 text-neutral-400">
            I wanted to build something people could genuinely connect with. Something that could
            still exist many years from now.
          </p>
        </div>

        <MediaFrame aspect="aspect-video" />
      </div>
    </Section>
  );
}
