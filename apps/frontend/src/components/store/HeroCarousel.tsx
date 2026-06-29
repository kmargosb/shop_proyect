'use client';

import Autoplay from 'embla-carousel-autoplay';
import HeroSlide from './HeroSlide';
import { useRef } from 'react';
import { heroSlides } from './data/heroSlides';
import { Carousel, CarouselContent, CarouselNext, CarouselPrevious } from '@/shared/ui/carousel';

export default function HeroCarousel() {
  const autoplay = useRef(
    Autoplay({
      delay: 5000,
      stopOnInteraction: true,
    }),
  );

  return (
    <section className="relative w-full overflow-hidden bg-black">
      <Carousel
        plugins={[autoplay.current]}
        opts={{
          loop: true,
        }}
        className="w-full"
        onMouseEnter={autoplay.current.stop}
        onMouseLeave={autoplay.current.reset}
        onTouchStart={autoplay.current.stop}
        onTouchEnd={() => {
          setTimeout(() => {
            autoplay.current.reset();
          }, 5000);
        }}
      >
        <CarouselContent>
          {heroSlides.map((slide, index) => (
            <HeroSlide key={slide.title} slide={slide} index={index} />
          ))}
        </CarouselContent>

        {/* ARROWS */}

        <CarouselPrevious className="left-4 hidden border-white/10 bg-black/40 text-white backdrop-blur-md hover:bg-black/60 md:flex" />

        <CarouselNext className="right-4 hidden border-white/10 bg-black/40 text-white backdrop-blur-md hover:bg-black/60 md:flex" />
      </Carousel>
    </section>
  );
}
