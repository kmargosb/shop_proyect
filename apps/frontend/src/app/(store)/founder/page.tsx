import type { Metadata } from 'next';

import Reveal from '../../../shared/ui/Reveal';

import BackgroundGlow from './components/BackgroundGlow';
import CamarguetteSection from './components/CamarguetteSection';
import FounderEnding from './components/FounderEnding';
import FounderLife from './components/FounderLife';
import HeroSection from './components/HeroSection';
import ModernToolsSection from './components/ModernToolsSection';
import QuoteSection from './components/QuoteSection';
import WhoIAmSection from './components/WhoIAmSection';

export const metadata: Metadata = {
  title: 'Founder',
  description:
    'Meet the founder behind Camarguette and discover the vision that inspires the brand.',
};

export default function FounderPage() {
  return (
    <main className="relative overflow-hidden bg-black text-white">
      <BackgroundGlow />

      <div className="mx-auto w-full max-w-[1600px] px-6 py-16">
        <Reveal>
          <HeroSection />
        </Reveal>

        <Reveal delay={0.05}>
          <CamarguetteSection />
        </Reveal>

        <Reveal delay={0.1}>
          <QuoteSection />
        </Reveal>

        <Reveal delay={0.15}>
          <WhoIAmSection />
        </Reveal>

        <Reveal delay={0.2}>
          <FounderLife />
        </Reveal>

        <Reveal delay={0.25}>
          <ModernToolsSection />
        </Reveal>

        <Reveal delay={0.3}>
          <FounderEnding />
        </Reveal>
      </div>
    </main>
  );
}
