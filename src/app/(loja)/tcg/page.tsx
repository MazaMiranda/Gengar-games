import type { Metadata } from 'next';
import Link from 'next/link';
import { Layers, ScanLine, ShieldCheck } from 'lucide-react';
import { searchCatalog } from '@/core/application/catalog-service';
import { PageHeader } from '@/components/layout/page-header';
import { ProductRail } from '@/components/shop/product-rail';
import { ProductCard } from '@/components/shop/product-card';
import { SectionHeading, Section } from '@/components/ui/section';
import { Reveal } from '@/components/ui/motion';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Área TCG',
  description:
    'Pokémon TCG: singles conferidos carta a carta e produtos selados com lacre original.',
};

export const revalidate = 600;

const PROMISES = [
  {
    icon: ScanLine,
    title: 'Conferência sob luz UV',
    text: 'Cada single passa por inspeção de centralização, superfície e bordas antes de entrar no estoque.',
  },
  {
    icon: ShieldCheck,
    title: 'Estado descrito de verdade',
    text: 'Classificamos de M a MP seguindo o padrão internacional. Se não estiver NM, o anúncio diz.',
  },
  {
    icon: Layers,
    title: 'Envio nível grading',
    text: 'Sleeve, toploader lacrado, caixa rígida e preenchimento. O mesmo padrão de quem envia para PSA.',
  },
];

export default async function TcgPage() {
  const [singles, sealed, protecao] = await Promise.all([
    searchCatalog({ types: ['tcg-card'], sort: 'relevancia', perPage: 10 }),
    searchCatalog({ types: ['tcg-sealed'], sort: 'mais-vendidos', perPage: 10 }),
    searchCatalog({ categories: ['protecao-tcg'], perPage: 8 }),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Área TCG"
        title="Pokémon TCG, uma curadoria obsessiva"
        description="Do single de R$ 12 à alt art de R$ 3.500 — tudo conferido à mão, classificado e enviado com proteção de nível grading."
        crumbs={[{ label: 'Início', href: '/' }, { label: 'TCG' }]}
        accent={265}
        actions={
          <Button asChild variant="secondary">
            <Link href="/tcg/pokemon">Ver por coleção</Link>
          </Button>
        }
      />

      <Section className="perf-contain">
        <SectionHeading
          eyebrow="Singles"
          title="Cartas avulsas em destaque"
          description="As peças mais procuradas do momento, prontas para envio."
          href="/catalogo?tipo=tcg-card"
          className="mb-10"
        />
        <ProductRail products={singles.items} />
      </Section>

      <Section className="perf-contain">
        <SectionHeading
          eyebrow="Selados"
          title="Booster boxes, ETBs e decks"
          description="Lacre de fábrica conferido em vídeo antes da postagem."
          href="/catalogo?tipo=tcg-sealed"
          className="mb-10"
        />
        <ProductRail products={sealed.items} />
      </Section>

      <Section>
        <div className="grid gap-4 md:grid-cols-3">
          {PROMISES.map(({ icon: Icon, title, text }, index) => (
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
          eyebrow="Proteção"
          title="Sleeves, toploaders e binders"
          description="O que usamos aqui dentro — e recomendamos para a sua coleção."
          href="/catalogo?categoria=protecao-tcg"
          className="mb-10"
        />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {protecao.items.slice(0, 4).map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </Section>
    </>
  );
}
