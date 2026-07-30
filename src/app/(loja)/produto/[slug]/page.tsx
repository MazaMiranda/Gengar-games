import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductDetail, searchCatalog } from '@/core/application/catalog-service';
import { PRODUCT_TYPES } from '@/core/domain/taxonomy';
import { BreadcrumbBar } from '@/components/layout/page-header';
import { ProductGallery } from '@/components/product/product-gallery';
import { BuyBox } from '@/components/product/buy-box';
import { ProductTabs } from '@/components/product/product-tabs';
import { ProductRail } from '@/components/shop/product-rail';
import { SectionHeading } from '@/components/ui/section';
import { RecentlyViewedTracker } from '@/components/product/recently-viewed';
import { formatPrice } from '@/lib/utils';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const result = await searchCatalog({ perPage: 500 });
  return result.items
    .filter((product) => product.type !== 'tcg-card')
    .map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getProductDetail(slug);
  if (!detail) return { title: 'Produto não encontrado' };

  const { product } = detail;
  return {
    title: product.name,
    description: `${product.subtitle} — ${formatPrice(product.price)} na Gengar Games. ${product.description.slice(0, 110)}`,
    openGraph: {
      title: `${product.name} · Gengar Games`,
      description: product.subtitle,
      type: 'website',
    },
  };
}

export const revalidate = 600;

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const detail = await getProductDetail(slug);
  if (!detail) notFound();

  const { product, related, reviews, questions, priceHistory, similar } = detail;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    sku: product.sku,
    brand: { '@type': 'Brand', name: product.brandSlug },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BRL',
      price: (product.price / 100).toFixed(2),
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <RecentlyViewedTracker slug={product.slug} />

      <BreadcrumbBar
        accent={product.accent}
        crumbs={[
          { label: 'Início', href: '/' },
          { label: 'Catálogo', href: '/catalogo' },
          { label: PRODUCT_TYPES[product.type], href: `/catalogo?tipo=${product.type}` },
          { label: product.categorySlug, href: `/catalogo?categoria=${product.categorySlug}` },
          { label: product.name },
        ]}
      />

      <div className="container-page grid gap-12 py-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <ProductGallery product={product} />
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

      {related.length ? (
        <section className="container-page py-16">
          <SectionHeading
            eyebrow="Combina com"
            title="Quem levou este, levou também"
            className="mb-8"
          />
          <ProductRail products={related} />
        </section>
      ) : null}

      {similar.length ? (
        <section className="container-page pb-20">
          <SectionHeading
            eyebrow="Da mesma categoria"
            title="Produtos similares"
            href={`/catalogo?categoria=${product.categorySlug}`}
            className="mb-8"
          />
          <ProductRail products={similar} />
        </section>
      ) : null}
    </>
  );
}
