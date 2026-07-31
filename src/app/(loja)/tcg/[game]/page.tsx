import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { searchCatalog } from '@/core/application/catalog-service';
import { TCG_GAMES, tcgGameList } from '@/core/domain/taxonomy';
import type { TcgGame } from '@/core/domain/entities';
import { PARAM, parseCatalogParams, toggleParam } from '@/lib/catalog-params';
import { PageHeader } from '@/components/layout/page-header';
import { FilterSidebar } from '@/components/catalog/filter-sidebar';
import { CatalogResults } from '@/components/catalog/catalog-results';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

  const rawParams = await searchParams;
  const query = parseCatalogParams(rawParams, 16);
  const result = await searchCatalog({ ...query, tcgs: [game as TcgGame] });

  const sets = result.facets.sets.slice(0, 8);

  // Base para os pills de coleção: os mesmos parâmetros já ativos na URL, para
  // que clicar num pill alterne só a coleção — sem descartar ordenação, faixa
  // de preço ou os demais filtros que o visitante já tinha escolhido.
  const baseParams = new URLSearchParams();
  for (const [key, value] of Object.entries(rawParams)) {
    if (value === undefined) continue;
    for (const item of Array.isArray(value) ? value : [value]) baseParams.append(key, item);
  }
  const selectedSets = new Set(query.sets ?? []);

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
            {sets.map((set) => {
              const active = selectedSets.has(set.value);
              const href = `/tcg/${game}?${toggleParam(baseParams, PARAM.set, set.value).toString()}`;
              return (
                <Link
                  key={set.value}
                  href={href}
                  aria-pressed={active}
                  className={cn(
                    'flex h-9 shrink-0 items-center gap-2 rounded-sm border px-3.5 text-xs font-medium transition-all',
                    active
                      ? 'border-brand-400/60 bg-brand-500/12 text-ink'
                      : 'border-line bg-ink/3 text-ink-muted hover:border-brand-400/40 hover:bg-brand-500/10 hover:text-ink',
                  )}
                >
                  {set.value}
                  <span className="font-tech text-[0.625rem] text-ink-ghost">{set.count}</span>
                </Link>
              );
            })}
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
