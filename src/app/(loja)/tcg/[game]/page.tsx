import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { searchCatalog } from '@/core/application/catalog-service';
import { TCG_GAMES, tcgGameList } from '@/core/domain/taxonomy';
import type { TcgGame } from '@/core/domain/entities';
import { parseCatalogParams } from '@/lib/catalog-params';
import { PageHeader } from '@/components/layout/page-header';
import { FilterSidebar } from '@/components/catalog/filter-sidebar';
import { CatalogResults } from '@/components/catalog/catalog-results';
import { Button } from '@/components/ui/button';

interface PageProps {
  params: Promise<{ game: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export function generateStaticParams() {
  return tcgGameList.map((game) => ({ game: game.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { game } = await params;
  const meta = TCG_GAMES[game as TcgGame];
  if (!meta) return { title: 'Card game não encontrado' };

  return {
    title: meta.name,
    description: `${meta.tagline} Singles e produtos selados de ${meta.name} na Gengar Games.`,
  };
}

export default async function TcgGamePage({ params, searchParams }: PageProps) {
  const { game } = await params;
  const meta = TCG_GAMES[game as TcgGame];
  if (!meta) notFound();

  const query = parseCatalogParams(await searchParams, 16);
  const result = await searchCatalog({ ...query, tcgs: [game as TcgGame] });

  const sets = result.facets.sets.slice(0, 8);

  return (
    <>
      <PageHeader
        accent={meta.accent}
        eyebrow={meta.publisher}
        title={meta.name}
        description={meta.tagline}
        crumbs={[{ label: 'Início', href: '/' }, { label: 'TCG', href: '/tcg' }, { label: meta.short }]}
        actions={
          <Button asChild variant="secondary">
            <Link href={`/catalogo?tcg=${game}&tipo=tcg-sealed`}>Ver produtos selados</Link>
          </Button>
        }
      />

      {sets.length > 1 ? (
        <div className="border-b border-line">
          <div className="container-page flex gap-2 overflow-x-auto py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {sets.map((set) => (
              <Link
                key={set.value}
                href={`/tcg/${game}?colecao=${encodeURIComponent(set.value)}`}
                className="flex h-9 shrink-0 items-center gap-2 rounded-sm border border-line bg-ink/3 px-3.5 text-xs font-medium text-ink-muted transition-all hover:border-brand-400/40 hover:bg-brand-500/10 hover:text-ink"
              >
                {set.value}
                <span className="font-tech text-[0.625rem] text-ink-ghost">{set.count}</span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <div className="container-page grid gap-10 py-12 lg:grid-cols-[17rem_1fr] lg:gap-12">
        <div className="hidden lg:block">
          <div className="sticky top-28 max-h-[calc(100dvh-9rem)] overflow-y-auto pr-2">
            <FilterSidebar facets={result.facets} />
          </div>
        </div>

        <CatalogResults
          items={result.items}
          facets={result.facets}
          total={result.total}
          page={result.page}
          pageCount={result.pageCount}
        />
      </div>
    </>
  );
}
