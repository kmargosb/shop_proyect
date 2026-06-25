import Section from '../../../../shared/ui/Section';
import SectionTitle from '../../../../shared/ui/SectionTitle';
import StackGrid from './StackGrid';

export default function ModernToolsSection() {
  return (
    <Section>
      <SectionTitle
        eyebrow="Built with Modern Tools"
        title="Modern technologies. Timeless craftsmanship."
        description="Every part of Camarguette has been designed, developed and maintained by me using modern technologies, open-source software and professional creative tools. From backend architecture to photography, branding and video production, every detail is crafted with intention."
      />

      <StackGrid />

      <p className="mt-16 max-w-3xl text-xl leading-relaxed text-white">
        Great products aren't built with expensive tools.
        <br />
        They're built with passion, curiosity and consistency.
      </p>
    </Section>
  );
}
