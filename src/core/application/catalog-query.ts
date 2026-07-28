import type { Product } from '../domain/entities';
import { CONDITIONS, PLATFORMS, PRODUCT_TYPES, RARITIES, TCG_GAMES } from '../domain/taxonomy';
import type { CatalogFacets, CatalogQuery, CatalogResult, FacetBucket } from '../ports/repositories';

export const DEFAULT_PER_PAGE = 12;

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

export function matchesSearch(product: Product, term: string) {
  const haystack = normalize(
    [
      product.name,
      product.subtitle,
      product.description,
      product.categorySlug,
      product.brandSlug,
      product.card?.set,
      product.card?.number,
      product.console?.edition,
      ...product.tags,
    ]
      .filter(Boolean)
      .join(' '),
  );
  return normalize(term)
    .split(/\s+/)
    .filter(Boolean)
    .every((token) => haystack.includes(token));
}

type Predicate = (product: Product) => boolean;

/** Um predicado por grupo de filtro — a chave é usada para excluir o próprio
 *  grupo na contagem de facetas (padrão "facetas disjuntivas"). */
export function buildPredicates(query: CatalogQuery): Record<string, Predicate> {
  return {
    search: (p) => !query.search || matchesSearch(p, query.search),
    categories: (p) => !query.categories?.length || query.categories.includes(p.categorySlug),
    brands: (p) => !query.brands?.length || query.brands.includes(p.brandSlug),
    platforms: (p) => !query.platforms?.length || (!!p.platform && query.platforms.includes(p.platform)),
    tcgs: (p) => !query.tcgs?.length || (!!p.tcg && query.tcgs.includes(p.tcg)),
    sets: (p) => !query.sets?.length || (!!p.card && query.sets.includes(p.card.set)),
    rarities: (p) => !query.rarities?.length || (!!p.card && query.rarities.includes(p.card.rarity)),
    languages: (p) => !query.languages?.length || (!!p.card && query.languages.includes(p.card.language)),
    conditions: (p) => !query.conditions?.length || query.conditions.includes(p.condition),
    types: (p) => !query.types?.length || query.types.includes(p.type),
    tags: (p) => !query.tags?.length || query.tags.some((tag) => p.tags.includes(tag)),
    price: (p) =>
      (query.minPrice === undefined || p.price >= query.minPrice) &&
      (query.maxPrice === undefined || p.price <= query.maxPrice),
    stock: (p) => !query.inStock || p.stock > 0,
    sale: (p) => !query.onSale || (!!p.compareAtPrice && p.compareAtPrice > p.price),
    featured: (p) => !query.featured || p.featured,
  };
}

function applyExcept(products: Product[], predicates: Record<string, Predicate>, except: string) {
  return products.filter((product) =>
    Object.entries(predicates).every(([key, predicate]) => key === except || predicate(product)),
  );
}

function countBy(products: Product[], resolve: (p: Product) => string[] | string | undefined) {
  const counter = new Map<string, number>();
  for (const product of products) {
    const raw = resolve(product);
    if (!raw) continue;
    for (const value of Array.isArray(raw) ? raw : [raw]) {
      counter.set(value, (counter.get(value) ?? 0) + 1);
    }
  }
  return counter;
}

function toBuckets(counter: Map<string, number>, label: (value: string) => string): FacetBucket[] {
  return [...counter.entries()]
    .map(([value, count]) => ({ value, label: label(value), count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

/** Só precisamos de slug e nome para rotular as facetas. */
export interface FacetLabels {
  categories: { slug: string; name: string }[];
  brands: { slug: string; name: string }[];
}

export const SORTERS: Record<string, (a: Product, b: Product) => number> = {
  relevancia: (a, b) => Number(b.featured) - Number(a.featured) || b.soldCount - a.soldCount,
  'menor-preco': (a, b) => a.price - b.price,
  'maior-preco': (a, b) => b.price - a.price,
  lancamentos: (a, b) => b.releasedAt.localeCompare(a.releasedAt),
  'mais-vendidos': (a, b) => b.soldCount - a.soldCount,
  avaliacao: (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
};

export function buildFacets(
  products: Product[],
  predicates: Record<string, Predicate>,
  labels: FacetLabels,
): CatalogFacets {
  const categoryName = new Map(labels.categories.map((c) => [c.slug, c.name]));
  const brandName = new Map(labels.brands.map((b) => [b.slug, b.name]));
  const pool = (except: string) => applyExcept(products, predicates, except);
  const pricePool = pool('price');

  return {
    categories: toBuckets(countBy(pool('categories'), (p) => p.categorySlug), (v) => categoryName.get(v) ?? v),
    brands: toBuckets(countBy(pool('brands'), (p) => p.brandSlug), (v) => brandName.get(v) ?? v),
    platforms: toBuckets(
      countBy(pool('platforms'), (p) => p.platform),
      (v) => PLATFORMS[v as keyof typeof PLATFORMS]?.name ?? v,
    ),
    tcgs: toBuckets(
      countBy(pool('tcgs'), (p) => p.tcg),
      (v) => TCG_GAMES[v as keyof typeof TCG_GAMES]?.name ?? v,
    ),
    sets: toBuckets(countBy(pool('sets'), (p) => p.card?.set), (v) => v),
    rarities: toBuckets(
      countBy(pool('rarities'), (p) => p.card?.rarity),
      (v) => RARITIES[v as keyof typeof RARITIES]?.name ?? v,
    ),
    languages: toBuckets(countBy(pool('languages'), (p) => p.card?.language), (v) => v),
    conditions: toBuckets(
      countBy(pool('conditions'), (p) => p.condition),
      (v) => CONDITIONS[v as keyof typeof CONDITIONS]?.name ?? v,
    ),
    types: toBuckets(
      countBy(pool('types'), (p) => p.type),
      (v) => PRODUCT_TYPES[v as keyof typeof PRODUCT_TYPES] ?? v,
    ),
    priceRange: {
      min: pricePool.length ? Math.min(...pricePool.map((p) => p.price)) : 0,
      max: pricePool.length ? Math.max(...pricePool.map((p) => p.price)) : 0,
    },
  };
}

/** Executa a consulta completa (filtro + ordenação + paginação + facetas). */
export function runCatalogQuery(
  products: Product[],
  query: CatalogQuery,
  labels: FacetLabels,
): CatalogResult {
  const predicates = buildPredicates(query);
  const filtered = products.filter((product) =>
    Object.values(predicates).every((predicate) => predicate(product)),
  );

  const sorted = [...filtered].sort(SORTERS[query.sort ?? 'relevancia'] ?? SORTERS.relevancia!);
  const perPage = query.perPage ?? DEFAULT_PER_PAGE;
  const pageCount = Math.max(1, Math.ceil(sorted.length / perPage));
  const page = Math.min(Math.max(1, query.page ?? 1), pageCount);

  return {
    items: sorted.slice((page - 1) * perPage, page * perPage),
    total: sorted.length,
    page,
    perPage,
    pageCount,
    facets: buildFacets(products, predicates, labels),
  };
}
