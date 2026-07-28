import type { Metadata } from 'next';
import { Suspense } from 'react';
import { searchCatalog } from '@/core/application/catalog-service';
import { parseCatalogParams } from '@/lib/catalog-params';
import { PageHeader } from '@/components/layout/page-header';
import { FilterSidebar } from '@/components/catalog/filter-sidebar';
import { CatalogResults } from '@/components/catalog/catalog-results';
import { ProductGridSkeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Catálogo',
  description:
    'Todo o catálogo Gengar Games: cartas, produtos selados, consoles, jogos, acessórios e colecionáveis com filtros avançados.',
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CatalogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = parseCatalogParams(params, 16);
  const result = await searchCatalog(query);

  return (
    <>
      <PageHeader
        compact
        eyebrow="Catálogo"
        title={query.search ? `Resultados para “${query.search}”` : 'Tudo o que temos em estoque'}
        description="Filtre por categoria, coleção, raridade, plataforma e estado. Os contadores refletem o estoque real."
        crumbs={[{ label: 'Início', href: '/' }, { label: 'Catálogo' }]}
      />

      <div className="container-page grid gap-10 py-12 lg:grid-cols-[17rem_1fr] lg:gap-12">
        <div className="hidden lg:block">
          <div className="sticky top-28 max-h-[calc(100dvh-9rem)] overflow-y-auto pr-2">
            <FilterSidebar facets={result.facets} />
          </div>
        </div>

        <Suspense fallback={<ProductGridSkeleton count={8} />}>
          <CatalogResults
            items={result.items}
            facets={result.facets}
            total={result.total}
            page={result.page}
            pageCount={result.pageCount}
          />
        </Suspense>
      </div>
    </>
  );
}
