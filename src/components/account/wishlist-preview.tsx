'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { ProductCard } from '@/components/shop/product-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useWishlistStore } from '@/stores/wishlist-store';
import { useHydratedList } from './wishlist-grid';

/** Prévia de favoritos e vistos recentemente na visão geral da conta. */
export function WishlistPreview() {
  const slugs = useWishlistStore((state) => state.slugs);
  const viewed = useWishlistStore((state) => state.recentlyViewed);

  const list = (slugs.length ? slugs : viewed).slice(0, 3);
  const { data, isLoading, mounted } = useHydratedList(list, 'wishlist-preview');

  if (!mounted) return null;
  if (!list.length) return null;

  return (
    <section className="flex flex-col gap-5">
      <header className="flex items-center justify-between gap-4">
        <h2 className="font-display text-base font-bold text-ink">
          {slugs.length ? 'Seus favoritos' : 'Vistos recentemente'}
        </h2>
        {slugs.length ? (
          <Link
            href="/conta/favoritos"
            className="group inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted transition-colors hover:text-brand-200"
          >
            Ver todos
            <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        ) : null}
      </header>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {list.map((slug) => (
            <Skeleton key={slug} className="aspect-4/5" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {data?.map((product) => <ProductCard key={product.slug} product={product} />)}
        </div>
      )}
    </section>
  );
}
