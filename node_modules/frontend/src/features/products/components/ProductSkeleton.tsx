"use client";

import { Skeleton } from "@/shared/ui/skeleton";

export default function ProductSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-14">
      {/* IMAGE */}

      <div className="space-y-4">
        <Skeleton className="aspect-square rounded-xl" />

        <div className="flex gap-3">
          <Skeleton className="w-20 h-20 rounded-md" />
          <Skeleton className="w-20 h-20 rounded-md" />
          <Skeleton className="w-20 h-20 rounded-md" />
        </div>
      </div>

      {/* INFO */}

      <div className="space-y-6">
        <Skeleton className="h-8 w-3/4" />

        <Skeleton className="h-6 w-32" />

        <Skeleton className="h-4 w-24" />

        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        <Skeleton className="h-10 w-32" />

        <div className="flex gap-4">
          <Skeleton className="h-11 w-40" />
          <Skeleton className="h-11 w-40" />
        </div>
      </div>
    </div>
  );
}