import { cn } from '@/lib/utils';

/** Placeholder de carregamento com varredura de luz — nunca um bloco cinza morto. */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md border border-line bg-ink/3',
        'after:absolute after:inset-0 after:-translate-x-full after:bg-linear-to-r after:from-transparent after:via-ink/8 after:to-transparent after:content-[""]',
        'after:animate-[sweep_1.6s_var(--ease-in-out-soft)_infinite]',
        className,
      )}
      {...props}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="plate flex flex-col gap-4 rounded-lg p-4">
      <Skeleton className="aspect-4/5 w-full rounded-md" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <Skeleton className="h-7 w-28" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }, (_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function LineSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className={cn('h-4', index === rows - 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  );
}
