import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getProductDetail, searchCatalog } from '@/core/application/catalog-service';
import { TCG_GAMES } from '@/core/domain/taxonomy';
import { PageHeader } from '@/components/layout/page-header';
import { ProductGallery } from '@/components/product/product-gallery';
import { BuyBox } from '@/components/product/buy-box';
import { CardAttributes } from '@/components/product/card-attributes';
import { ProductTabs } from '@/components/product/product-tabs';
import { RecentlyViewedTracker } from '@/components/product/recently-viewed';
import { ProductRail } from '@/components/shop/product-rail';
import { SectionHeading } from '@/components/ui/section';
import { formatPrice } from '@/lib/utils';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const result = await searchCatalog({ types: ['tcg-card'], perPage: 500 });
  return result.items.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getProductDetail(slug);
  if (!detail?.product.card) return { title: 'Carta não encontrada' };

  const { product } = detail;
  return {
    title: `${product.name} — ${product.card!.set}`,
    description: `${product.name} (${product.card!.number}) de ${product.card!.set} por ${formatPrice(product.price)}. Estado ${product.card!.grade}, idioma ${product.card!.language}.`,
  };
}

export const revalidate = 600;

export default async function CardPage({ params }: PageProps) {
  const { slug } = await params;
  const detail = await getProductDetail(slug);
  if (!detail) notFound();

  // Produtos que não são cartas moram na rota canônica de produto.
  if (!detail.product.card) redirect(`/produto/${slug}`);

  const { product, related, reviews, questions, priceHistory, similar } = detail;
  const card = product.card!;
  const game = TCG_GAMES[card.game];

  return (
    <>
      <RecentlyViewedTracker slug={product.slug} />

      <PageHeader
        compact
        accent={product.accent}
        eyebrow={`${game.name} · ${card.set}`}
        title={product.name}
        crumbs={[
          { label: 'Início', href: '/' },
          { label: 'TCG', href: '/tcg' },
          { label: game.short, href: `/tcg/${card.game}` },
          { label: product.name },
        ]}
      />

      <div className="container-page grid gap-12 py-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <div className="flex flex-col gap-8">
          <ProductGallery product={product} />
          <CardAttributes card={card} product={product} />
        </div>
        <BuyBox product={product} />
      </div>

      <section className="container-page py-8">
        <ProductTabs
          product={product}
          reviews={reviews}
          questions={questions}
          priceHistory={priceHistory}
        />
      </section>

      {similar.length ? (
        <section className="container-page py-16">
          <SectionHeading
            eyebrow="Mesma coleção"
            title="Cartas similares"
            description={`Outras cartas de ${game.name} disponíveis agora.`}
            href={`/tcg/${card.game}`}
            className="mb-8"
          />
          <ProductRail products={similar} />
        </section>
      ) : null}

      {related.length ? (
        <section className="container-page pb-20">
          <SectionHeading eyebrow="Proteja sua coleção" title="Costuma sair junto" className="mb-8" />
          <ProductRail products={related} />
        </section>
      ) : null}
    </>
  );
}
