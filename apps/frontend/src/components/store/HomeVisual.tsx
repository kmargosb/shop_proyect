import Image from "next/image";
import Link from "next/link";

type Props = {
  title: string;
  subtitle: string;
  image: string;
  reverse?: boolean;
};

export default function HomeVisual({
  title,
  subtitle,
  image,
  reverse,
}: Props) {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <div
        className={`grid md:grid-cols-2 gap-10 items-center ${
          reverse ? "md:flex-row-reverse" : ""
        }`}
      >
        {/* IMAGE */}
        <div className="relative h-[400px] w-full rounded-xl overflow-hidden">
          <Image src={image} alt={title} fill className="object-cover" />
        </div>

        {/* TEXT */}
        <div className="space-y-4 text-white">
          <h2 className="text-3xl md:text-4xl font-bold">
            {title}
          </h2>

          <p className="text-neutral-400">
            {subtitle}
          </p>

          <Link
            href="/shop"
            className="inline-block mt-4 px-6 py-3 bg-white text-black rounded-md hover:bg-neutral-200 transition"
          >
            Shop now
          </Link>
        </div>
      </div>
    </section>
  );
}