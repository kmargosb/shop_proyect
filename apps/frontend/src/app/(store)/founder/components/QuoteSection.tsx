import Section from '../../../../shared/ui/Section';

export default function QuoteSection() {
  return (
    <Section className="border-none">
      <h2 className="max-w-5xl text-5xl leading-tight font-light tracking-tight text-white md:text-7xl xl:text-8xl">
        "For more than half of my life,
        <br />
        I've wanted to build something
        <br />
        that truly lasts."
      </h2>

      <p className="mt-10 text-lg text-neutral-500">The future isn't someday. The future is now.</p>
    </Section>
  );
}
