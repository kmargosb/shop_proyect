"use client";

export default function ProductCardSkeleton() {
  return (
    <div className="bg-neutral-900 rounded-xl overflow-hidden p-4 space-y-4 animate-pulse">
      <div className="aspect-square bg-neutral-800 rounded-md" />

      <div className="h-4 bg-neutral-800 rounded w-3/4" />
      <div className="h-4 bg-neutral-800 rounded w-1/3" />

      <div className="h-10 bg-neutral-800 rounded" />
    </div>
  );
}