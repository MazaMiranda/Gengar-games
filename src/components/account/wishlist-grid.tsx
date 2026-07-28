'use client';

import * as React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import type { Product } from '@/core/domain/entities';
import { ProductCard } from '@/components/shop/product-card';
import { ProductGridSkeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useWishlistStore } from '@/stores/wishlist-store';

async function fetchBySlugs(slugs: string[]): Promise<Product[]> {
  if (!slugs.length) return [];
  const response = await fetch(`/api/products/lote?slugs=${slugs.join(',')}`);
  const data = await response.json();
  return data.items as Product[];
}

/** Lê a wishlist do armazenamento local e hidrata os produtos pelo servidor. */
export function useHydratedList(slugs: string[], key: string) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const query = useQuery({
    queryKey: [key, slugs.join(',')],
    queryFn: () => fetchBySlugs(slugs),
    enabled: mounted,
    staleTime: 60_000,
  });

  return { ...query, mounted };
}

export function WishlistGrid() {
  const slugs = useWishlistStore((state) => state.slugs);
  const { data, isLoading, mounted } = useHydratedList(slugs, 'wishlist');

  if (!mounted || isLoading) return <ProductGridSkeleton count={4} />;

  if (!slugs.length || !data?.length) {
    return (
      <div className="plate flex flex-col items-center gap-4 rounded-xl px-6 py-16 text-center">
        <span className="grid size-14 place-items-center rounded-full border border-line bg-white/3">
          <Heart className="size-5 text-ink-faint" />
        </span>
        <div>
          <h2 className="font-display text-base font-bold text-ink">Sua lista está vazia</h2>
          <p className="mt-1.5 max-w-sm text-sm text-ink-muted">
            Toque no coração de qualquer produto para guardar aqui e receber alerta de restock.
          </p>
        </div>
        <Button asChild variant="secondary" size="sm">
          <Link href="/catalogo">Descobrir produtos</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
      {data.map((product) => (
        <ProductCard key={product.slug} product={product} />
      ))}
    </div>
  );
}
