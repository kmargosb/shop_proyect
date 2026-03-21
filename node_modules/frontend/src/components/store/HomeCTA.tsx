import Link from "next/link";

export default function HomeCTA() {
  return (
    <section className="bg-neutral-900 text-white py-20 text-center">
      <div className="max-w-3xl mx-auto px-6 space-y-6">
        <h2 className="text-3xl md:text-4xl font-bold">
          Descubre tu estilo
        </h2>

        <p className="text-neutral-400">
          Productos seleccionados, diseño minimalista y calidad premium.
        </p>

        <Link
          href="/shop"
          className="inline-block mt-4 px-8 py-3 bg-white text-black font-medium rounded-md hover:bg-neutral-200 transition"
        >
          Explorar tienda
        </Link>
      </div>
    </section>
  );
}