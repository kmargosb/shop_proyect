"use client";

import Image from "next/image";
import Link from "next/link";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type Slide = {
  title: string;
  subtitle: string;
  image: string;
  link: string;
};

const slides: Slide[] = [
  {
    title: "New Collection",
    subtitle: "Discover the latest arrivals",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
    link: "/shop",
  },
  {
    title: "Premium Essentials",
    subtitle: "Minimal design, maximum quality",
    image: "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb",
    link: "/shop",
  },
  {
    title: "Limited Drops",
    subtitle: "Exclusive products available now",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552",
    link: "/shop",
  },
];

export default function HeroCarousel() {
  return (
    <section className="w-full">
      <Carousel
        opts={{
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem key={index}>
              <div className="relative h-[70vh] w-full">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  priority
                  className="object-cover"
                />

                <div className="absolute inset-0 bg-black/40" />

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white space-y-4">
                    <h2 className="text-4xl md:text-6xl font-bold">
                      {slide.title}
                    </h2>

                    <p className="text-lg opacity-90">{slide.subtitle}</p>

                    <Link
                      href={slide.link}
                      className="inline-block mt-4 px-6 py-3 bg-white text-black font-medium rounded-md hover:bg-neutral-200 transition"
                    >
                      Shop now
                    </Link>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
      </Carousel>
    </section>
  );
}
