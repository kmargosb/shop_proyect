import { Skeleton } from '@/shared/ui/skeleton';

export default function ProductsSkeleton() {
  const skeletons = Array.from({ length: 8 });

  return (
    <>
      {skeletons.map((_, i) => (
        <div key={i} className="min-w-[48%] md:min-w-0">
          <div className="overflow-hidden rounded-2xl bg-white">
            <Skeleton className="aspect-[4/5] w-full" />

            <div className="space-y-3 p-3">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-4/5" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="mt-4 h-10 w-full rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
