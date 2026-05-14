"use client";

export default function WishlistTab() {
  return (
    <div className="rounded-3xl border border-white/10 bg-neutral-950 p-6">
      <h2 className="text-2xl font-bold">Wishlist</h2>

      <p className="mt-2 text-sm text-neutral-500">
        Guarda productos para más tarde.
      </p>

      <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-10 text-center text-neutral-500">
        Tu wishlist está vacía.
      </div>
    </div>
  );
}