import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <div className="max-w-xl text-center">
        <p className="text-sm tracking-[0.4em] text-neutral-500 uppercase">Error 404</p>

        <h1 className="mt-6 text-5xl font-bold md:text-7xl">Page not found</h1>

        <p className="mt-6 text-neutral-400">
          The page you are looking for does not exist or has been moved.
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <Link
            href="/"
            className="rounded-2xl bg-white px-6 py-3 font-medium text-black transition hover:bg-neutral-200"
          >
            Home
          </Link>

          <Link
            href="/shop"
            className="rounded-2xl border border-white/20 px-6 py-3 font-medium text-white transition hover:bg-white/10"
          >
            Shop
          </Link>
        </div>
      </div>
    </main>
  );
}
