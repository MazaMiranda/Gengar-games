'use client';

import * as React from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import type { CatalogFacets, FacetBucket } from '@/core/ports/repositories';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/disclosure';
import { Checkbox, Separator, Slider, Switch } from '@/components/ui/controls';
import { Button } from '@/components/ui/button';
import { useCatalogFilters } from '@/hooks/use-catalog-filters';
import { PARAM } from '@/lib/catalog-params';
import { cn, formatPrice } from '@/lib/utils';

interface FilterSidebarProps {
  facets: CatalogFacets;
  className?: string;
  onNavigate?: () => void;
}

const GROUPS: { key: string; title: string; facet: keyof CatalogFacets }[] = [
  { key: PARAM.category, title: 'Categoria', facet: 'categories' },
  { key: PARAM.type, title: 'Tipo de produto', facet: 'types' },
  { key: PARAM.tcg, title: 'Card game', facet: 'tcgs' },
  { key: PARAM.set, title: 'Coleção / Expansão', facet: 'sets' },
  { key: PARAM.rarity, title: 'Raridade', facet: 'rarities' },
  { key: PARAM.grade, title: 'Estado da carta', facet: 'grades' },
  { key: PARAM.language, title: 'Idioma', facet: 'languages' },
  { key: PARAM.platform, title: 'Plataforma', facet: 'platforms' },
  { key: PARAM.brand, title: 'Marca', facet: 'brands' },
  { key: PARAM.condition, title: 'Estado', facet: 'conditions' },
];

export function FilterSidebar({ facets, className, onNavigate }: FilterSidebarProps) {
  const { toggle, set, apply, isSelected, clearAll, activeCount, searchParams } = useCatalogFilters();

  const min = facets.priceRange.min;
  const max = facets.priceRange.max;
  const currentMin = Number(searchParams.get(PARAM.minPrice) ?? min);
  const currentMax = Number(searchParams.get(PARAM.maxPrice) ?? max);
  const [range, setRange] = React.useState<[number, number]>([currentMin, currentMax]);

  React.useEffect(() => {
    setRange([currentMin, currentMax]);
  }, [currentMin, currentMax]);

  /** Os dois extremos entram na mesma navegação. */
  const commitRange = (value: number[]) => {
    const [low, high] = value as [number, number];
    const params = new URLSearchParams(searchParams.toString());

    if (low > min) params.set(PARAM.minPrice, String(low));
    else params.delete(PARAM.minPrice);
    if (high < max) params.set(PARAM.maxPrice, String(high));
    else params.delete(PARAM.maxPrice);
    params.delete(PARAM.page);

    apply(params);
  };

  const visibleGroups = GROUPS.filter((group) => (facets[group.facet] as FacetBucket[]).length > 1);

  return (
    <aside className={cn('flex flex-col gap-6', className)} aria-label="Filtros do catálogo">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-sm font-bold text-ink">
          <SlidersHorizontal className="size-4 text-brand-300" />
          Filtros
          {activeCount > 0 ? (
            <span className="grid size-5 place-items-center rounded-full bg-brand-500 font-tech text-[0.625rem] font-bold text-white">
              {activeCount}
            </span>
          ) : null}
        </h2>
        {activeCount > 0 ? (
          <button
            type="button"
            onClick={() => {
              clearAll();
              onNavigate?.();
            }}
            className="inline-flex items-center gap-1 text-2xs font-semibold uppercase tracking-wider text-ink-faint transition-colors hover:text-danger"
          >
            <X className="size-3" />
            Limpar
          </button>
        ) : null}
      </div>

      {/* Chaves rápidas */}
      <div className="flex flex-col gap-3 rounded-lg border border-line bg-ink/2 p-4">
        <label className="flex cursor-pointer items-center justify-between gap-3">
          <span className="text-xs font-medium text-ink-muted">Somente em estoque</span>
          <Switch
            checked={searchParams.get(PARAM.inStock) === '1'}
            onCheckedChange={(checked) => set(PARAM.inStock, checked ? '1' : null)}
          />
        </label>
        <Separator />
        <label className="flex cursor-pointer items-center justify-between gap-3">
          <span className="text-xs font-medium text-ink-muted">Somente em promoção</span>
          <Switch
            checked={searchParams.get(PARAM.onSale) === '1'}
            onCheckedChange={(checked) => set(PARAM.onSale, checked ? '1' : null)}
          />
        </label>
      </div>

      {/* Faixa de preço */}
      {max > min ? (
        <div className="flex flex-col gap-4 rounded-lg border border-line bg-ink/2 p-4">
          <div className="flex items-center justify-between">
            <span className="font-tech text-2xs font-semibold uppercase tracking-[0.18em] text-ink-muted">
              Faixa de preço
            </span>
          </div>
          <Slider
            min={min}
            max={max}
            step={1000}
            value={range}
            onValueChange={(value) => setRange(value as [number, number])}
            onValueCommit={commitRange}
            aria-label="Faixa de preço"
          />
          <div className="flex items-center justify-between font-tech text-2xs text-ink-faint">
            <span>{formatPrice(range[0])}</span>
            <span>{formatPrice(range[1])}</span>
          </div>
        </div>
      ) : null}

      <Accordion
        type="multiple"
        defaultValue={visibleGroups.slice(0, 3).map((group) => group.key)}
        className="flex flex-col"
      >
        {visibleGroups.map((group) => {
          const buckets = facets[group.facet] as FacetBucket[];
          return (
            <AccordionItem key={group.key} value={group.key}>
              <AccordionTrigger>{group.title}</AccordionTrigger>
              <AccordionContent>
                <ul className="flex max-h-64 flex-col gap-0.5 overflow-y-auto pr-1">
                  {buckets.map((bucket) => {
                    const checked = isSelected(group.key, bucket.value);
                    return (
                      <li key={bucket.value}>
                        <label
                          className={cn(
                            'flex cursor-pointer items-center gap-3 rounded-sm px-2 py-2 transition-colors hover:bg-ink/4',
                            checked && 'bg-brand-500/8',
                          )}
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => {
                              toggle(group.key, bucket.value);
                              onNavigate?.();
                            }}
                          />
                          <span
                            className={cn(
                              'flex-1 text-xs transition-colors',
                              checked ? 'font-semibold text-ink' : 'text-ink-muted',
                            )}
                          >
                            {bucket.label}
                          </span>
                          <span className="font-tech text-[0.625rem] text-ink-ghost">{bucket.count}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {activeCount > 0 ? (
        <Button
          variant="outline"
          size="sm"
          block
          onClick={() => {
            clearAll();
            onNavigate?.();
          }}
        >
          Limpar todos os filtros
        </Button>
      ) : null}
    </aside>
  );
}
