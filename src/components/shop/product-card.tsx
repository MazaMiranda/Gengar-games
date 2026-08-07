'use client';

import * as React from 'react';
import Link from 'next/link';
import { Eye, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '@/core/domain/entities';
import { CONDITIONS, RARITIES } from '@/core/domain/taxonomy';
import { Badge } from '@/components/ui/badge';
import { DiscountTag, Price } from '@/components/ui/price';
import { Rating } from '@/components/ui/rating';
import { cn, formatPrice } from '@/lib/utils';
import { toCartLine, useCartStore } from '@/stores/cart-store';
import { ProductVisual } from './product-visual';
import { WishlistButton } from './wishlist-button';

interface ProductCardProps {
  product: Product;
  className?: string;
  layout?: 'grid' | 'row';
  priority?: boolean;
}

const RARITY_TONE: Record<string, string> = {
  comum: 'text-rarity-common',
  incomum: 'text-rarity-uncommon',
  rara: 'text-rarity-rare',
  'ultra-rara': 'text-rarity-ultra',
  secreta: 'text-rarity-secret',
};

export function ProductCard({ product, className, layout = 'grid', priority }: ProductCardProps) {
  const add = useCartStore((state) => state.add);
  const soldOut = product.stock <= 0;
  const lowStock = product.stock > 0 && product.stock <= 3;
  const href = product.type === 'tcg-card' ? `/carta/${product.slug}` : `/produto/${product.slug}`;

  /** O brilho holográfico segue o ponteiro através de --mx/--my. */
  const handlePointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--mx', `${((event.clientX - rect.left) / rect.width) * 100}%`);
    event.currentTarget.style.setProperty('--my', `${((event.clientY - rect.top) / rect.height) * 100}%`);
  };

  const quickAdd = (event: React.MouseEvent) => {
    event.preventDefault();
    add(toCartLine(product));
    toast.success('Adicionado ao carrinho', {
      description: `${product.name} · ${formatPrice(product.price)}`,
    });
  };

  if (layout === 'row') {
    return (
      <Link
        href={href}
        className={cn(
          'plate group flex gap-4 rounded-lg p-3 transition-all duration-500 ease-out-expo hover:border-line-brand hover:shadow-lift',
          className,
        )}
      >
        <div className="holo relative aspect-square w-24 shrink-0 overflow-hidden rounded-md" onPointerMove={handlePointer}>
          <ProductVisual product={product} variant="thumb" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 py-1">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink group-hover:text-brand-100">{product.name}</p>
            <p className="truncate text-xs text-ink-faint">{product.subtitle}</p>
          </div>
          <Price value={product.price} compareAt={product.compareAtPrice} size="sm" />
        </div>
      </Link>
    );
  }

  return (
    <article
      className={cn(
        'plate group relative flex h-full flex-col overflow-hidden rounded-lg transition-all duration-500 ease-out-expo hover:-translate-y-1 hover:border-line-brand hover:shadow-lift',
        soldOut && 'opacity-70',
        className,
      )}
    >
      <Link href={href} className="flex flex-1 flex-col focus-visible:outline-none">
        <div
          className="holo relative aspect-4/5 overflow-hidden rounded-t-lg"
          onPointerMove={handlePointer}
        >
          <ProductVisual product={product} priority={priority} />

          {/* Etiquetas */}
          <div className="absolute left-3 top-3 z-3 flex flex-col items-start gap-1.5">
            {product.compareAtPrice ? (
              <DiscountTag value={product.price} compareAt={product.compareAtPrice} />
            ) : null}
            {product.preOrder ? <Badge variant="info" size="sm">Pré-venda</Badge> : null}
            {product.condition === 'usado' ? <Badge variant="neutral" size="sm">Usado</Badge> : null}
            {product.condition === 'seminovo' ? <Badge variant="neutral" size="sm">Seminovo</Badge> : null}
          </div>

          {/* Ações rápidas */}
          <div className="absolute right-3 top-3 z-3 flex flex-col gap-2 opacity-0 transition-all duration-400 ease-out-expo group-hover:opacity-100 max-md:opacity-100">
            <WishlistButton slug={product.slug} name={product.name} />
            {/* Selo decorativo de "ver": no celular ele ficava ao lado do
                favoritar com a mesma cara de botão, mas não é clicável —
                dois ícones iguais, um funciona e o outro não. */}
            <span className="hidden size-9 place-items-center rounded-md border border-line bg-void/50 text-ink-muted backdrop-blur-md transition-colors group-hover:text-brand-200 md:grid">
              <Eye className="size-4" />
            </span>
          </div>

          {/* Estado de estoque */}
          {soldOut ? (
            <div className="absolute inset-0 z-3 grid place-items-center bg-void/72 backdrop-blur-[3px]">
              <span className="rounded-sm border border-line-strong px-4 py-2 font-tech text-2xs font-bold uppercase tracking-[0.28em] text-ink-muted">
                Esgotado
              </span>
            </div>
          ) : null}

          {/*
            Adicionar rápido — afordância de mouse, escondida onde não há hover.
            Sem o `hidden md:flex` ela continuava no celular: invisível
            (opacity-0), mas ainda clicável, uma faixa de 141x44 sobre a parte
            de baixo da capa. O toque ali não abria o produto; jogava o item no
            carrinho sem nada aparecer onde o dedo encostou.
          */}
          {!soldOut ? (
            <button
              type="button"
              onClick={quickAdd}
              className="absolute inset-x-3 bottom-3 z-3 hidden h-11 translate-y-3 items-center justify-center gap-2 rounded-md border border-brand-400/40 bg-void/75 text-xs font-semibold text-ink opacity-0 backdrop-blur-lg transition-all duration-400 ease-out-expo hover:bg-brand-500/25 group-hover:translate-y-0 group-hover:opacity-100 md:flex"
            >
              <ShoppingBag className="size-3.5" />
              Adicionar rápido
            </button>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate font-tech text-2xs uppercase tracking-[0.18em] text-ink-faint">
              {product.card ? product.card.set : CONDITIONS[product.condition].name}
            </span>
            {product.card ? (
              <span
                className={cn(
                  'shrink-0 font-tech text-2xs font-semibold uppercase tracking-wider',
                  RARITY_TONE[product.card.rarity],
                )}
              >
                {RARITIES[product.card.rarity].name}
              </span>
            ) : null}
          </div>

          <div className="flex flex-1 flex-col gap-1">
            <h3 className="line-clamp-2 font-display text-sm font-semibold leading-snug text-ink transition-colors duration-300 group-hover:text-brand-100">
              {product.name}
            </h3>
            <p className="line-clamp-1 text-xs text-ink-faint">{product.subtitle}</p>
          </div>

          <Rating value={product.rating} count={product.reviewCount} />

          <div className="flex items-end justify-between gap-3 pt-1">
            <Price value={product.price} compareAt={product.compareAtPrice} size="md" reserveCompare />
            {lowStock ? (
              <span className="pb-1 font-tech text-2xs font-semibold uppercase tracking-wider text-warning">
                {product.stock} restantes
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    </article>
  );
}
