import { getRepositories } from '@/infrastructure/container';
import type { Product } from '../domain/entities';
import type { CatalogQuery, CatalogResult } from '../ports/repositories';

export async function searchCatalog(query: CatalogQuery): Promise<CatalogResult> {
  const { products } = await getRepositories();
  return products.search(query);
}

export async function listCategories() {
  const { products } = await getRepositories();
  return products.listCategories();
}

export async function listBrands() {
  const { products } = await getRepositories();
  return products.listBrands();
}

export async function getProductBySlug(slug: string) {
  const { products } = await getRepositories();
  return products.findBySlug(slug);
}

export async function getProductsBySlugs(slugs: string[]) {
  const { products } = await getRepositories();
  return products.findManyBySlugs(slugs);
}

export interface ProductDetail {
  product: Product;
  related: Product[];
  reviews: Awaited<ReturnType<Awaited<ReturnType<typeof getRepositories>>['products']['reviewsFor']>>;
  questions: Awaited<ReturnType<Awaited<ReturnType<typeof getRepositories>>['products']['questionsFor']>>;
  priceHistory: Awaited<
    ReturnType<Awaited<ReturnType<typeof getRepositories>>['products']['priceHistoryFor']>
  >;
  similar: Product[];
}

export async function getProductDetail(slug: string): Promise<ProductDetail | null> {
  const { products } = await getRepositories();
  const product = await products.findBySlug(slug);
  if (!product) return null;

  const [related, reviews, questions, priceHistory, sameFamily] = await Promise.all([
    products.findManyBySlugs(product.relatedSlugs),
    products.reviewsFor(slug),
    products.questionsFor(slug),
    products.priceHistoryFor(slug),
    products.search({
      categories: [product.categorySlug],
      perPage: 12,
      sort: 'mais-vendidos',
    }),
  ]);

  const similar = sameFamily.items.filter((item) => item.slug !== slug).slice(0, 8);

  return { product, related: related.length ? related : similar.slice(0, 4), reviews, questions, priceHistory, similar };
}

/** Blocos da home resolvidos em paralelo — uma única passagem pelo repositório. */
export async function getHomeData() {
  const { products } = await getRepositories();

  const [categories, brands, destaques, novidades, ofertas, maisVendidos, destaquesTcg, consoles, jogos, acessorios, colecionaveis] =
    await Promise.all([
      products.listCategories(),
      products.listBrands(),
      products.search({ featured: true, inStock: true, sort: 'maior-preco', perPage: 40 }),
      products.search({ sort: 'lancamentos', perPage: 8, inStock: true }),
      products.search({ onSale: true, sort: 'relevancia', perPage: 8 }),
      products.search({ sort: 'mais-vendidos', perPage: 8 }),
      products.search({ types: ['tcg-card', 'tcg-sealed'], sort: 'relevancia', perPage: 8 }),
      products.search({ categories: ['consoles', 'consoles-limitados'], sort: 'relevancia', perPage: 6 }),
      products.search({ categories: ['jogos', 'jogos-usados'], sort: 'mais-vendidos', perPage: 8 }),
      products.search({ categories: ['controles', 'headsets', 'acessorios'], sort: 'relevancia', perPage: 8 }),
      products.search({ categories: ['colecionaveis', 'edicoes-colecionador', 'geek'], sort: 'relevancia', perPage: 8 }),
    ]);

  // Vitrine do hero: uma carta, um console e um colecionável — variedade garantida.
  const pickFeatured = (predicate: (slug: string) => boolean) =>
    destaques.items.find((product) => predicate(product.type) || predicate(product.categorySlug));

  const hero = [
    pickFeatured((value) => value === 'tcg-card'),
    pickFeatured((value) => value === 'console'),
    pickFeatured((value) => value === 'collectible' || value === 'accessory'),
  ].filter((product): product is NonNullable<typeof product> => Boolean(product));

  return {
    categories,
    brands,
    hero: hero.length >= 3 ? hero : destaques.items.slice(0, 3),
    novidades: novidades.items,
    ofertas: ofertas.items,
    maisVendidos: maisVendidos.items,
    destaquesTcg: destaquesTcg.items,
    consoles: consoles.items,
    jogos: jogos.items,
    acessorios: acessorios.items,
    colecionaveis: colecionaveis.items,
    totalProdutos: await products.countAll(),
  };
}
