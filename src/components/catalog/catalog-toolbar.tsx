'use client';

import * as React from 'react';
import { LayoutGrid, Rows3, SlidersHorizontal } from 'lucide-react';
import type { CatalogFacets, FacetBucket } from '@/core/ports/repositories';
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Chip } from '@/components/ui/chip';
import { useCatalogFilters } from '@/hooks/use-catalog-filters';
import { PARAM, SORT_OPTIONS } from '@/lib/catalog-params';
import { cn, formatPrice } from '@/lib/utils';
import { FilterSidebar } from './filter-sidebar';

interface ToolbarProps {
  facets: CatalogFacets;
  total: number;
  density: 'comfortable' | 'compact';
  onDensityChange: (density: 'comfortable' | 'compact') => void;
}

const LABEL_BY_KEY: Record<string, string> = {
  [PARAM.category]: 'Categoria',
  [PARAM.brand]: 'Marca',
  [PARAM.platform]: 'Plataforma',
  [PARAM.tcg]: 'TCG',
  [PARAM.set]: 'Coleção',
  [PARAM.rarity]: 'Raridade',
  [PARAM.grade]: 'Estado da carta',
  [PARAM.language]: 'Idioma',
  [PARAM.condition]: 'Estado',
  [PARAM.type]: 'Tipo',
  [PARAM.tag]: 'Tag',
  [PARAM.search]: 'Busca',
};

export function CatalogToolbar({ facets, total, density, onDensityChange }: ToolbarProps) {
  const { searchParams, set, toggle, apply, clearAll, activeCount, pending } = useCatalogFilters();
  const [filtersOpen, setFiltersOpen] = React.useState(false);

  const sort = searchParams.get(PARAM.sort) ?? 'relevancia';

  const FACET_BY_KEY: Record<string, FacetBucket[] | undefined> = {
    [PARAM.category]: facets.categories,
    [PARAM.brand]: facets.brands,
    [PARAM.platform]: facets.platforms,
    [PARAM.tcg]: facets.tcgs,
    [PARAM.rarity]: facets.rarities,
    [PARAM.grade]: facets.grades,
    [PARAM.condition]: facets.conditions,
    [PARAM.type]: facets.types,
    [PARAM.language]: facets.languages,
    [PARAM.set]: facets.sets,
  };

  const bucketLabel = (key: string, value: string) =>
    FACET_BY_KEY[key]?.find((bucket) => bucket.value === value)?.label ?? value;

  const activeChips = Object.entries(LABEL_BY_KEY).flatMap(([key, label]) =>
    searchParams.getAll(key).map((value) => ({ key, label, value })),
  );

  const minPrice = searchParams.get(PARAM.minPrice);
  const maxPrice = searchParams.get(PARAM.maxPrice);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">
          <strong className={cn('font-display font-bold text-ink transition-opacity', pending && 'opacity-40')}>
            {total}
          </strong>{' '}
          {total === 1 ? 'produto encontrado' : 'produtos encontrados'}
        </p>

        <div className="flex items-center gap-2">
          {/* Filtros no mobile */}
          <Drawer open={filtersOpen} onOpenChange={setFiltersOpen}>
            <DrawerTrigger asChild>
              <Button variant="secondary" size="sm" className="lg:hidden">
                <SlidersHorizontal className="size-4" />
                Filtros
                {activeCount > 0 ? (
                  <span className="grid size-5 place-items-center rounded-full bg-brand-500 font-tech text-[0.625rem] font-bold text-white">
                    {activeCount}
                  </span>
                ) : null}
              </Button>
            </DrawerTrigger>
            <DrawerContent side="left" className="max-w-sm">
              <DrawerHeader>
                <DrawerTitle>Filtrar produtos</DrawerTitle>
                <DrawerCloseButton />
              </DrawerHeader>
              <DrawerBody>
                <FilterSidebar facets={facets} />
              </DrawerBody>
              <DrawerFooter>
                <Button block onClick={() => setFiltersOpen(false)}>
                  Ver {total} {total === 1 ? 'produto' : 'produtos'}
                </Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>

          <div className="hidden items-center rounded-md border border-line p-0.5 sm:flex">
            <button
              type="button"
              onClick={() => onDensityChange('comfortable')}
              aria-label="Visualização em grade"
              aria-pressed={density === 'comfortable'}
              className={cn(
                'grid size-8 place-items-center rounded-sm transition-colors',
                density === 'comfortable' ? 'bg-ink/8 text-ink' : 'text-ink-faint hover:text-ink-muted',
              )}
            >
              <LayoutGrid className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDensityChange('compact')}
              aria-label="Visualização compacta"
              aria-pressed={density === 'compact'}
              className={cn(
                'grid size-8 place-items-center rounded-sm transition-colors',
                density === 'compact' ? 'bg-ink/8 text-ink' : 'text-ink-faint hover:text-ink-muted',
              )}
            >
              <Rows3 className="size-3.5" />
            </button>
          </div>

          <Select value={sort} onValueChange={(value) => set(PARAM.sort, value)}>
            <SelectTrigger className="w-48" aria-label="Ordenar resultados">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {activeChips.length > 0 || minPrice || maxPrice ? (
        <div className="flex flex-wrap items-center gap-2">
          {activeChips.map(({ key, label, value }) => (
            <Chip
              key={`${key}-${value}`}
              active
              onRemove={() => (key === PARAM.search ? set(key, null) : toggle(key, value))}
            >
              <span className="text-ink-faint">{label}:</span> {bucketLabel(key, value)}
            </Chip>
          ))}

          {minPrice || maxPrice ? (
            <Chip
              active
              onRemove={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.delete(PARAM.minPrice);
                params.delete(PARAM.maxPrice);
                params.delete(PARAM.page);
                apply(params);
              }}
            >
              <span className="text-ink-faint">Preço:</span>{' '}
              {formatPrice(Number(minPrice ?? facets.priceRange.min))} –{' '}
              {formatPrice(Number(maxPrice ?? facets.priceRange.max))}
            </Chip>
          ) : null}

          <button
            type="button"
            onClick={clearAll}
            className="ml-1 text-2xs font-semibold uppercase tracking-wider text-ink-faint transition-colors hover:text-danger"
          >
            Limpar tudo
          </button>
        </div>
      ) : null}
    </div>
  );
}
