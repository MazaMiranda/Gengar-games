'use client';

import { Eye, ShoppingBag } from '@phosphor-icons/react/dist/ssr';
import * as React from 'react';
import Link from 'next/link';
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
    event.currentTarget.style.setProperty(
      '--mx',
      `${((event.clientX - rect.left) / rect.width) * 100}%`,
    );
    event.currentTarget.style.setProperty(
      '--my',
      `${((event.clientY - rect.top) / rect.height) * 100}%`,
    );
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
          'plate group ease-out-expo hover:border-line-brand hover:shadow-lift flex gap-4 rounded-lg p-3 transition-all duration-500',
          className,
        )}
      >
        <div
          className="holo relative aspect-square w-24 shrink-0 overflow-hidden rounded-md"
          onPointerMove={handlePointer}
        >
          <ProductVisual product={product} variant="thumb" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 py-1">
          <div className="min-w-0">
            <p className="text-ink group-hover:text-brand-100 truncate text-sm font-semibold">
              {product.name}
            </p>
            <p className="text-ink-faint truncate text-xs">{product.subtitle}</p>
          </div>
          <Price value={product.price} compareAt={product.compareAtPrice} size="sm" />
        </div>
      </Link>
    );
  }

  return (
    <article
      className={cn(
        'plate group ease-out-expo hover:border-line-brand hover:shadow-lift relative flex h-full flex-col overflow-hidden rounded-lg transition-all duration-500 hover:-translate-y-1',
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
          <div className="absolute top-3 left-3 z-3 flex flex-col items-start gap-1.5">
            {product.compareAtPrice ? (
              <DiscountTag value={product.price} compareAt={product.compareAtPrice} />
            ) : null}
            {product.preOrder ? (
              <Badge variant="info" size="sm">
                Pré-venda
              </Badge>
            ) : null}
            {product.condition === 'usado' ? (
              <Badge variant="neutral" size="sm">
                Usado
              </Badge>
            ) : null}
            {product.condition === 'seminovo' ? (
              <Badge variant="neutral" size="sm">
                Seminovo
              </Badge>
            ) : null}
          </div>

          {/* Ações rápidas */}
          <div className="ease-out-expo absolute top-3 right-3 z-3 flex flex-col gap-2 opacity-0 transition-all duration-400 group-hover:opacity-100 max-md:opacity-100">
            <WishlistButton slug={product.slug} name={product.name} />
            {/* Selo decorativo de "ver": no celular ele ficava ao lado do
                favoritar com a mesma cara de botão, mas não é clicável —
                dois ícones iguais, um funciona e o outro não. */}
            <span className="border-line bg-void/50 text-ink-muted group-hover:text-brand-200 hidden size-9 place-items-center rounded-md border backdrop-blur-md transition-colors md:grid">
              <Eye className="size-4" />
            </span>
          </div>

          {/* Estado de estoque */}
          {soldOut ? (
            <div className="bg-void/72 absolute inset-0 z-3 grid place-items-center backdrop-blur-[3px]">
              <span className="border-line-strong bg-surface text-ink rounded-md border px-3 py-1.5 text-xs font-medium">
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
              className="border-brand-400/40 bg-void/75 text-ink ease-out-expo hover:bg-brand-500/25 absolute inset-x-3 bottom-3 z-3 hidden h-11 translate-y-3 items-center justify-center gap-2 rounded-md border text-xs font-semibold opacity-0 backdrop-blur-lg transition-all duration-400 group-hover:translate-y-0 group-hover:opacity-100 md:flex"
            >
              <ShoppingBag className="size-3.5" />
              Adicionar rápido
            </button>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          {/*
            Metadado, não HUD.
            Estas duas linhas eram caixa alta com tracking de 0.18em, e como o
            card se repete umas sessenta vezes na home isso sozinho respondia
            pela maior parte dos 127 rótulos gritados da página. O dado é o
            mesmo; só parou de berrar. A raridade continua codificada por cor,
            que é o que carrega a informação de verdade.
          */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-ink-faint truncate">
              {product.card ? product.card.set : CONDITIONS[product.condition].name}
            </span>
            {product.card ? (
              <span className={cn('shrink-0 font-medium', RARITY_TONE[product.card.rarity])}>
                {RARITIES[product.card.rarity].name}
              </span>
            ) : null}
          </div>

          <div className="flex flex-1 flex-col gap-1">
            <h3 className="font-display text-ink group-hover:text-brand-100 line-clamp-2 text-sm leading-snug font-semibold transition-colors duration-300">
              {product.name}
            </h3>
            <p className="text-ink-faint line-clamp-1 text-xs">{product.subtitle}</p>
          </div>

          <Rating value={product.rating} count={product.reviewCount} />

          <div className="flex items-end justify-between gap-3 pt-1">
            <Price
              value={product.price}
              compareAt={product.compareAtPrice}
              size="md"
              reserveCompare
            />
            {lowStock ? (
              <span className="text-warning pb-1 text-xs font-medium">
                {product.stock} restantes
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    </article>
  );
}
