import { LineSkeleton, Skeleton } from '@/components/ui/skeleton';

export default function ProductLoading() {
  return (
    <div className="container-page grid gap-12 py-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
      <div className="flex flex-col gap-4 lg:flex-row-reverse lg:gap-5">
        <Skeleton className="aspect-square flex-1 rounded-xl" />
        <div className="flex gap-3 lg:w-20 lg:flex-col">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="aspect-square w-20 rounded-md" />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-3/4" />
        <LineSkeleton rows={3} />
        <Skeleton className="h-16 w-56" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    </div>
  );
}
