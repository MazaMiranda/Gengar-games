'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '@/core/domain/entities';
import { cn } from '@/lib/utils';
import { ProductCard } from './product-card';

interface ProductRailProps {
  products: Product[];
  className?: string;
  itemClassName?: string;
}

/** Carrossel com snap, máscara lateral e controles que somem nas pontas. */
export function ProductRail({ products, className, itemClassName }: ProductRailProps) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [edges, setEdges] = React.useState({ start: true, end: false });

  const updateEdges = React.useCallback(() => {
    const node = trackRef.current;
    if (!node) return;
    setEdges({
      start: node.scrollLeft <= 8,
      end: node.scrollLeft + node.clientWidth >= node.scrollWidth - 8,
    });
  }, []);

  React.useEffect(() => {
    updateEdges();
    const node = trackRef.current;
    if (!node) return;
    node.addEventListener('scroll', updateEdges, { passive: true });
    window.addEventListener('resize', updateEdges);
    return () => {
      node.removeEventListener('scroll', updateEdges);
      window.removeEventListener('resize', updateEdges);
    };
  }, [updateEdges]);

  const scrollBy = (direction: 1 | -1) => {
    const node = trackRef.current;
    if (!node) return;
    node.scrollBy({ left: direction * Math.max(280, node.clientWidth * 0.8), behavior: 'smooth' });
  };

  if (!products.length) return null;

  return (
    <div className={cn('relative', className)}>
      <div
        ref={trackRef}
        className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product, index) => (
          <div
            key={product.slug}
            className={cn(
              'w-[72vw] shrink-0 snap-start sm:w-[46vw] md:w-[31vw] lg:w-[23vw] xl:w-[19rem]',
              itemClassName,
            )}
          >
            <ProductCard product={product} priority={index < 2} />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => scrollBy(-1)}
        aria-label="Anterior"
        className={cn(
          'absolute -left-4 top-[38%] hidden size-11 place-items-center rounded-full border border-line bg-void/80 text-ink-muted backdrop-blur-xl transition-all duration-300 hover:border-brand-400/50 hover:text-ink hover:shadow-glow-sm lg:grid',
          edges.start && 'pointer-events-none opacity-0',
        )}
      >
        <ChevronLeft className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => scrollBy(1)}
        aria-label="Próximo"
        className={cn(
          'absolute -right-4 top-[38%] hidden size-11 place-items-center rounded-full border border-line bg-void/80 text-ink-muted backdrop-blur-xl transition-all duration-300 hover:border-brand-400/50 hover:text-ink hover:shadow-glow-sm lg:grid',
          edges.end && 'pointer-events-none opacity-0',
        )}
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}
