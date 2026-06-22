'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error(error);

  return (
    <html>
      <body className="bg-black text-white">
        <main className="flex min-h-screen items-center justify-center px-6">
          <div className="max-w-xl text-center">
            <p className="text-sm tracking-[0.4em] text-neutral-500 uppercase">Fatal Error</p>

            <h1 className="mt-6 text-5xl font-bold md:text-7xl">Something broke</h1>

            <p className="mt-6 text-neutral-400">
              A critical error occurred while loading the application.
            </p>

            <button
              onClick={() => reset()}
              className="mt-10 rounded-2xl bg-white px-6 py-3 font-medium text-black transition hover:bg-neutral-200"
            >
              Reload
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
