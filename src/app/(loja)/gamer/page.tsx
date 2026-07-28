import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Cable, Gamepad2, Wrench } from 'lucide-react';
import { searchCatalog } from '@/core/application/catalog-service';
import { platformList } from '@/core/domain/taxonomy';
import { PageHeader } from '@/components/layout/page-header';
import { ProductRail } from '@/components/shop/product-rail';
import { ProductCard } from '@/components/shop/product-card';
import { Section, SectionHeading } from '@/components/ui/section';
import { Reveal } from '@/components/ui/motion';

export const metadata: Metadata = {
  title: 'Área Gamer',
  description:
    'Consoles PlayStation, Xbox, Nintendo, PC e retrô. Jogos novos e usados, controles, headsets e acessórios com garantia Gengar.',
};

export const revalidate = 600;

const SERVICES = [
  {
    icon: Wrench,
    title: 'Bancada própria',
    text: 'Todo console usado passa por revisão, limpeza interna e teste de leitura antes de ser anunciado.',
  },
  {
    icon: Cable,
    title: 'Compatibilidade conferida',
    text: 'Listamos exatamente quais acessórios e jogos funcionam com cada plataforma. Sem surpresa na entrega.',
  },
  {
    icon: Gamepad2,
    title: '90 dias de garantia',
    text: 'Seminovos e usados têm garantia da loja, com troca sem burocracia em caso de defeito.',
  },
];

export default async function GamerPage() {
  const [consoles, jogos, usados, acessorios] = await Promise.all([
    searchCatalog({ categories: ['consoles', 'consoles-limitados'], sort: 'relevancia', perPage: 8 }),
    searchCatalog({ categories: ['jogos'], sort: 'mais-vendidos', perPage: 10 }),
    searchCatalog({ categories: ['jogos-usados'], sort: 'relevancia', perPage: 8 }),
    searchCatalog({ categories: ['controles', 'headsets', 'acessorios'], sort: 'mais-vendidos', perPage: 10 }),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Área gamer"
        title="Consoles, jogos e periféricos com procedência"
        description="Do PS5 Pro lacrado ao Super Nintendo restaurado na nossa bancada. Cada item com ficha técnica honesta e garantia clara."
        crumbs={[{ label: 'Início', href: '/' }, { label: 'Gamer' }]}
        accent={214}
      />

      <Section>
        <SectionHeading eyebrow="Plataformas" title="Escolha o seu ecossistema" className="mb-10" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {platformList.map((platform, index) => (
            <Reveal key={platform.slug} delay={index * 0.05}>
              <Link
                href={`/gamer/${platform.slug}`}
                className="plate grain group relative flex h-56 flex-col justify-between overflow-hidden rounded-xl p-6 transition-all duration-500 ease-out-expo hover:-translate-y-1 hover:border-line-brand hover:shadow-lift"
              >
                <div
                  className="absolute inset-0 opacity-30 transition-opacity duration-700 group-hover:opacity-55"
                  style={{
                    background: `radial-gradient(130% 100% at 15% 0%, hsl(${platform.accent} 85% 52% / 0.65), transparent 62%)`,
                  }}
                  aria-hidden
                />
                <div className="relative flex items-start justify-between">
                  <span className="font-tech text-2xs font-bold uppercase tracking-[0.26em] text-ink-muted">
                    {platform.short}
                  </span>
                  <ArrowUpRight className="size-4 text-ink-ghost transition-all duration-400 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-300" />
                </div>
                <div className="relative flex flex-col gap-2">
                  <h3 className="font-display text-lg font-bold text-ink">{platform.name}</h3>
                  <p className="text-xs leading-relaxed text-ink-muted">{platform.tagline}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="perf-contain">
        <SectionHeading
          eyebrow="Hardware"
          title="Consoles disponíveis"
          description="Novos, seminovos e edições limitadas — todos com nota fiscal."
          href="/catalogo?categoria=consoles&categoria=consoles-limitados"
          className="mb-10"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {consoles.items.slice(0, 4).map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </Section>

      <Section className="perf-contain">
        <SectionHeading
          eyebrow="Mídia física"
          title="Jogos que valem a prateleira"
          href="/catalogo?categoria=jogos"
          className="mb-10"
        />
        <ProductRail products={jogos.items} />
      </Section>

      <Section>
        <div className="grid gap-4 md:grid-cols-3">
          {SERVICES.map(({ icon: Icon, title, text }, index) => (
            <Reveal key={title} delay={index * 0.06}>
              <div className="plate flex h-full flex-col gap-4 rounded-xl p-7">
                <span className="grid size-11 place-items-center rounded-md border border-line bg-brand-500/12 text-brand-300">
                  <Icon className="size-5" strokeWidth={1.6} />
                </span>
                <h3 className="font-display text-base font-bold text-ink">{title}</h3>
                <p className="text-sm leading-relaxed text-ink-muted">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="perf-contain">
        <SectionHeading
          eyebrow="Preço justo"
          title="Usados com garantia de 90 dias"
          description="Testados item a item. O anúncio descreve o estado real do disco e da caixa."
          href="/catalogo?categoria=jogos-usados"
          className="mb-10"
        />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {usados.items.slice(0, 4).map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </Section>

      <Section className="perf-contain">
        <SectionHeading
          eyebrow="Periféricos"
          title="Controles, headsets e upgrades"
          href="/catalogo?categoria=controles&categoria=headsets&categoria=acessorios"
          className="mb-10"
        />
        <ProductRail products={acessorios.items} />
      </Section>
    </>
  );
}
