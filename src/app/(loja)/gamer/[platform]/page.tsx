import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { searchCatalog } from '@/core/application/catalog-service';
import { PLATFORMS, platformList } from '@/core/domain/taxonomy';
import type { GamingPlatform } from '@/core/domain/entities';
import { PageHeader } from '@/components/layout/page-header';
import { ProductCard } from '@/components/shop/product-card';
import { ProductRail } from '@/components/shop/product-rail';
import { Section, SectionHeading } from '@/components/ui/section';
import { Price } from '@/components/ui/price';
import { Button } from '@/components/ui/button';
import { ProductVisual } from '@/components/shop/product-visual';
import { Reveal } from '@/components/ui/motion';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ platform: string }>;
}

export function generateStaticParams() {
  return platformList.map((platform) => ({ platform: platform.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { platform } = await params;
  const meta = PLATFORMS[platform as GamingPlatform];
  if (!meta) return { title: 'Plataforma não encontrada' };

  return {
    title: meta.name,
    description: `${meta.tagline} Consoles, jogos e acessórios ${meta.name} na Gengar Games.`,
  };
}

export const revalidate = 600;

export default async function PlatformPage({ params }: PageProps) {
  const { platform } = await params;
  const key = platform as GamingPlatform;
  const meta = PLATFORMS[key];
  if (!meta) notFound();

  const [consoles, jogos, acessorios, todos] = await Promise.all([
    searchCatalog({ platforms: [key], types: ['console'], sort: 'maior-preco', perPage: 6 }),
    searchCatalog({ platforms: [key], types: ['game'], sort: 'mais-vendidos', perPage: 10 }),
    searchCatalog({ platforms: [key], types: ['accessory'], sort: 'mais-vendidos', perPage: 10 }),
    searchCatalog({ platforms: [key], perPage: 100 }),
  ]);

  const flagship = consoles.items[0];

  return (
    <>
      <PageHeader
        accent={meta.accent}
        eyebrow="Área gamer"
        title={meta.name}
        description={meta.tagline}
        crumbs={[
          { label: 'Início', href: '/' },
          { label: 'Gamer', href: '/gamer' },
          { label: meta.short },
        ]}
        actions={
          <Button asChild variant="secondary">
            <Link href={`/catalogo?plataforma=${key}`}>Ver todos os {todos.total} produtos</Link>
          </Button>
        }
      />

      {flagship ? (
        <Section>
          <Reveal className="plate grain relative overflow-hidden rounded-2xl">
            <div
              className="absolute -right-24 -top-24 size-96 rounded-full opacity-45 blur-[110px]"
              style={{ background: `radial-gradient(circle, hsl(${meta.accent} 88% 55% / 0.6), transparent 70%)` }}
              aria-hidden
            />
            <div className="relative grid gap-10 p-8 lg:grid-cols-2 lg:items-center lg:p-12">
              <div className="holo relative aspect-4/3 overflow-hidden rounded-xl border border-line">
                <ProductVisual product={flagship} variant="detail" />
              </div>

              <div className="flex flex-col gap-6">
                {/* Sem kicker acima do título — "Destaque da plataforma"
                    vira cert-label anexado ao nome, não linha antes dele. */}
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-title font-bold text-ink">{flagship.name}</h2>
                    <span className="cert-label">Destaque da plataforma</span>
                  </div>
                  <p className="text-sm leading-relaxed text-ink-muted">{flagship.description}</p>
                </div>

                {flagship.console ? (
                  <dl className="grid grid-cols-2 gap-4 border-y border-line py-5">
                    <div>
                      <dt className="font-tech text-2xs uppercase tracking-[0.16em] text-ink-faint">
                        Geração
                      </dt>
                      <dd className="mt-1 text-sm font-semibold text-ink">{flagship.console.generation}</dd>
                    </div>
                    <div>
                      <dt className="font-tech text-2xs uppercase tracking-[0.16em] text-ink-faint">
                        Armazenamento
                      </dt>
                      <dd className="mt-1 text-sm font-semibold text-ink">{flagship.console.storage}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="font-tech text-2xs uppercase tracking-[0.16em] text-ink-faint">
                        Vem na caixa
                      </dt>
                      <dd className="mt-1 text-sm text-ink-muted">
                        {flagship.console.includes.join(' · ')}
                      </dd>
                    </div>
                  </dl>
                ) : null}

                <div className="flex flex-wrap items-end justify-between gap-4">
                  <Price value={flagship.price} compareAt={flagship.compareAtPrice} size="lg" installments />
                  <Button asChild size="lg">
                    <Link href={`/produto/${flagship.slug}`}>Ver detalhes</Link>
                  </Button>
                </div>
              </div>
            </div>
          </Reveal>
        </Section>
      ) : null}

      {consoles.items.length > 1 ? (
        <Section className="perf-contain">
          <SectionHeading
            eyebrow="Hardware"
            title={`Consoles ${meta.name}`}
            href={`/catalogo?plataforma=${key}&tipo=console`}
            className="mb-10"
          />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {consoles.items.slice(0, 4).map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </Section>
      ) : null}

      {jogos.items.length ? (
        <Section className="perf-contain">
          <SectionHeading
            eyebrow="Biblioteca"
            title="Jogos relacionados"
            description={`Mídia física compatível com ${meta.name}.`}
            href={`/catalogo?plataforma=${key}&tipo=game`}
            className="mb-10"
          />
          <ProductRail products={jogos.items} />
        </Section>
      ) : null}

      {acessorios.items.length ? (
        <Section className="perf-contain">
          <SectionHeading
            eyebrow="Compatíveis"
            title="Acessórios e periféricos"
            description="Controles, headsets e upgrades testados nesta plataforma."
            href={`/catalogo?plataforma=${key}&tipo=accessory`}
            className="mb-10"
          />
          <ProductRail products={acessorios.items} />
        </Section>
      ) : null}
    </>
  );
}
