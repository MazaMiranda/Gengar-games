'use client';

import { Package } from '@phosphor-icons/react/dist/ssr';
import * as React from 'react';
import Link from 'next/link';
import type { Product } from '@/core/domain/entities';
import type { CatalogFacets } from '@/core/ports/repositories';
import { ProductCard } from '@/components/shop/product-card';
import { Button } from '@/components/ui/button';
import { StaggerItem, StaggerList } from '@/components/ui/motion';
import { CatalogToolbar } from './catalog-toolbar';
import { Pagination } from './pagination';

interface CatalogResultsProps {
  items: Product[];
  facets: CatalogFacets;
  total: number;
  page: number;
  pageCount: number;
}

export function CatalogResults({ items, facets, total, page, pageCount }: CatalogResultsProps) {
  const [density, setDensity] = React.useState<'comfortable' | 'compact'>('comfortable');

  return (
    <div className="flex flex-col gap-8">
      <CatalogToolbar
        facets={facets}
        total={total}
        density={density}
        onDensityChange={setDensity}
      />

      {items.length === 0 ? (
        <div className="plate flex flex-col items-center gap-5 rounded-xl px-6 py-20 text-center">
          <span className="border-line bg-ink/3 grid size-16 place-items-center rounded-full border">
            <Package className="text-ink-faint size-6" />
          </span>
          <div className="max-w-sm">
            <h3 className="font-display text-ink text-lg font-bold">Nenhum produto encontrado</h3>
            <p className="text-ink-muted mt-2 text-sm leading-relaxed">
              Tente remover alguns filtros ou buscar por outro termo. Nosso estoque muda todo dia.
            </p>
          </div>
          <Button asChild variant="secondary">
            <Link href="/catalogo">Ver catálogo completo</Link>
          </Button>
        </div>
      ) : (
        <StaggerList
          className={
            density === 'comfortable'
              ? 'grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4'
              : 'grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3'
          }
        >
          {items.map((product, index) => (
            <StaggerItem key={product.slug} index={index % 8} className="h-full">
              {density === 'comfortable' ? (
                <ProductCard product={product} priority={index < 4} />
              ) : (
                <ProductCard product={product} layout="row" />
              )}
            </StaggerItem>
          ))}
        </StaggerList>
      )}

      <Pagination page={page} pageCount={pageCount} />
    </div>
  );
}
