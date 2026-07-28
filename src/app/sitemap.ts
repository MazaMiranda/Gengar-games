import type { MetadataRoute } from 'next';
import { listCategories, searchCatalog } from '@/core/application/catalog-service';
import { platformList, tcgGameList } from '@/core/domain/taxonomy';
import { institutionalPages } from '@/lib/institucional';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gengargames.com.br';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [catalog, categories] = await Promise.all([
    searchCatalog({ perPage: 1000 }),
    listCategories(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/catalogo`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/tcg`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/gamer`, changeFrequency: 'weekly', priority: 0.8 },
  ];

  return [
    ...staticRoutes,
    ...tcgGameList.map((game) => ({
      url: `${BASE}/tcg/${game.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...platformList.map((platform) => ({
      url: `${BASE}/gamer/${platform.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...categories.map((category) => ({
      url: `${BASE}/catalogo?categoria=${category.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
    ...catalog.items.map((product) => ({
      url: `${BASE}/${product.type === 'tcg-card' ? 'carta' : 'produto'}/${product.slug}`,
      lastModified: new Date(product.releasedAt),
      changeFrequency: 'weekly' as const,
      priority: product.featured ? 0.8 : 0.6,
    })),
    ...institutionalPages.map((page) => ({
      url: `${BASE}/institucional/${page.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    })),
  ];
}
