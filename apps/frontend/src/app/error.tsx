'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <div className="max-w-xl text-center">
        <p className="text-sm tracking-[0.4em] text-neutral-500 uppercase">Error</p>

        <h1 className="mt-6 text-5xl font-bold md:text-7xl">Something went wrong</h1>

        <p className="mt-6 text-neutral-400">
          An unexpected error occurred while loading this page.
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <button
            onClick={() => reset()}
            className="rounded-2xl bg-white px-6 py-3 font-medium text-black transition hover:bg-neutral-200"
          >
            Try again
          </button>
        </div>
      </div>
    </main>
  );
}
