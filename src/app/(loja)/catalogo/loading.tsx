import { ProductGridSkeleton, Skeleton } from '@/components/ui/skeleton';

export default function CatalogLoading() {
  return (
    <div className="container-page grid gap-10 py-12 lg:grid-cols-[17rem_1fr] lg:gap-12">
      <div className="hidden flex-col gap-4 lg:flex">
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>

      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-11 w-48" />
        </div>
        <ProductGridSkeleton count={8} />
      </div>
    </div>
  );
}
