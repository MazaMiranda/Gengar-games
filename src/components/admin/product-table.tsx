'use client';

import { ArrowSquareOut, MagnifyingGlass } from '@phosphor-icons/react/dist/ssr';
import * as React from 'react';
import Link from 'next/link';
import type { Product } from '@/core/domain/entities';
import { CONDITIONS, PRODUCT_TYPES } from '@/core/domain/taxonomy';
import { DataTable } from '@/components/admin/admin-shell';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LineThumb } from '@/components/shop/line-thumb';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn, formatPrice } from '@/lib/utils';

interface ProductTableProps {
  products: Product[];
  categories: { slug: string; name: string }[];
  mode?: 'catalog' | 'stock';
}

/** Tabela de catálogo com busca e filtro por categoria — tudo no cliente. */
export function ProductTable({ products, categories, mode = 'catalog' }: ProductTableProps) {
  const [term, setTerm] = React.useState('');
  const [category, setCategory] = React.useState('todas');

  const filtered = React.useMemo(() => {
    const search = term.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory = category === 'todas' || product.categorySlug === category;
      const matchesTerm =
        !search ||
        product.name.toLowerCase().includes(search) ||
        product.sku.toLowerCase().includes(search) ||
        product.subtitle.toLowerCase().includes(search);
      return matchesCategory && matchesTerm;
    });
  }, [products, term, category]);

  const categoryName = new Map(categories.map((item) => [item.slug, item.name]));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Buscar por nome ou SKU…"
          icon={<MagnifyingGlass className="size-4" />}
          className="h-11 sm:max-w-sm"
          aria-label="Buscar produto"
        />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="sm:w-56" aria-label="Filtrar por categoria">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as categorias</SelectItem>
            {categories.map((item) => (
              <SelectItem key={item.slug} value={item.slug}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-ink-faint text-xs sm:ml-auto">
          {filtered.length} de {products.length}
        </span>
      </div>

      <div className="plate overflow-hidden rounded-xl">
        <DataTable
          rows={filtered}
          getKey={(product) => product.slug}
          empty="Nenhum produto corresponde ao filtro."
          columns={[
            {
              key: 'product',
              header: 'Produto',
              render: (product) => (
                <div className="flex items-center gap-2.5">
                  <LineThumb
                    slug={product.slug}
                    name={product.name}
                    type={product.type}
                    accent={product.accent}
                    className="border-line size-8 shrink-0 rounded-md border"
                  />
                  <div className="flex min-w-0 flex-col">
                    <span className="text-ink line-clamp-1 text-xs font-semibold">
                      {product.name}
                    </span>
                    <span className="font-tech text-2xs text-ink-ghost">{product.sku}</span>
                  </div>
                </div>
              ),
            },
            {
              key: 'category',
              header: 'Categoria',
              render: (product) => (
                <span className="text-xs">
                  {categoryName.get(product.categorySlug) ?? product.categorySlug}
                </span>
              ),
            },
            {
              key: 'type',
              header: 'Tipo',
              render: (product) => (
                <Badge variant="neutral" size="sm">
                  {PRODUCT_TYPES[product.type]}
                </Badge>
              ),
            },
            ...(mode === 'stock'
              ? [
                  {
                    key: 'condition',
                    header: 'Estado',
                    render: (product: Product) => (
                      <span className="text-xs">{CONDITIONS[product.condition].name}</span>
                    ),
                  },
                ]
              : []),
            {
              key: 'price',
              header: 'Preço',
              align: 'right' as const,
              render: (product: Product) => (
                <div className="flex flex-col items-end">
                  <span className="font-display text-ink text-sm font-bold">
                    {formatPrice(product.price)}
                  </span>
                  {product.compareAtPrice ? (
                    <span className="text-2xs text-ink-ghost line-through">
                      {formatPrice(product.compareAtPrice)}
                    </span>
                  ) : null}
                </div>
              ),
            },
            {
              key: 'stock',
              header: 'Estoque',
              align: 'center' as const,
              render: (product: Product) => (
                <span
                  className={cn(
                    'font-tech inline-flex h-7 min-w-9 items-center justify-center rounded-sm px-2 text-xs font-bold',
                    product.stock === 0
                      ? 'bg-danger/12 text-danger'
                      : product.stock <= 4
                        ? 'bg-warning/12 text-warning'
                        : 'bg-success/10 text-success',
                  )}
                >
                  {product.stock}
                </span>
              ),
            },
            {
              key: 'actions',
              header: '',
              align: 'right' as const,
              render: (product: Product) => (
                <Link
                  href={
                    product.type === 'tcg-card'
                      ? `/carta/${product.slug}`
                      : `/produto/${product.slug}`
                  }
                  className="tap-44 text-2xs text-ink-faint hover:text-brand-200 inline-flex items-center gap-1.5 font-semibold transition-colors"
                >
                  Ver
                  <ArrowSquareOut className="size-3" />
                </Link>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
