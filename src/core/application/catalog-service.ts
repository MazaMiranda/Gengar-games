import { getRepositories } from '@/infrastructure/container';
import type { Product } from '../domain/entities';
import type { CatalogQuery, CatalogResult } from '../ports/repositories';
import tcgdexImages from '@/infrastructure/data/tcgdex-images.json';

const REAL_ART_SLUGS = new Set(Object.keys(tcgdexImages.cards));

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
  reviews: Awaited<
    ReturnType<Awaited<ReturnType<typeof getRepositories>>['products']['reviewsFor']>
  >;
  questions: Awaited<
    ReturnType<Awaited<ReturnType<typeof getRepositories>>['products']['questionsFor']>
  >;
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

  return {
    product,
    related: related.length ? related : similar.slice(0, 4),
    reviews,
    questions,
    priceHistory,
    similar,
  };
}

/** Blocos da home resolvidos em paralelo — uma única passagem pelo repositório. */
export async function getHomeData() {
  const { products } = await getRepositories();

  const [
    categories,
    brands,
    destaques,
    novidades,
    ofertas,
    maisVendidos,
    destaquesTcg,
    consoles,
    jogos,
    acessorios,
    colecionaveis,
  ] = await Promise.all([
    products.listCategories(),
    products.listBrands(),
    products.search({ featured: true, inStock: true, sort: 'maior-preco', perPage: 40 }),
    products.search({ sort: 'lancamentos', perPage: 8, inStock: true }),
    products.search({ onSale: true, sort: 'relevancia', perPage: 8 }),
    products.search({ sort: 'mais-vendidos', perPage: 8 }),
    products.search({ types: ['tcg-card', 'tcg-sealed'], sort: 'relevancia', perPage: 8 }),
    products.search({
      categories: ['consoles', 'consoles-limitados'],
      sort: 'relevancia',
      perPage: 6,
    }),
    products.search({ categories: ['jogos', 'jogos-usados'], sort: 'mais-vendidos', perPage: 8 }),
    products.search({
      categories: ['controles', 'headsets', 'acessorios'],
      sort: 'relevancia',
      perPage: 8,
    }),
    products.search({
      categories: ['colecionaveis', 'edicoes-colecionador', 'geek'],
      sort: 'relevancia',
      perPage: 8,
    }),
  ]);

  /*
   * Vitrine do hero: três cartas TCG, priorizando quem já tem foto real da
   * TCGdex — a carta é o produto mais fotogênico da loja, e mostrar console
   * ou colecionável ao lado (sem foto própria) só empatava a primeira
   * impressão. Cai para outros destaques só se o catálogo tiver menos de
   * três cartas.
   */
  const cardCandidates = destaquesTcg.items.filter((product) => product.type === 'tcg-card');
  const heroCards = [...cardCandidates].sort(
    (a, b) => Number(REAL_ART_SLUGS.has(b.slug)) - Number(REAL_ART_SLUGS.has(a.slug)),
  );
  const hero = heroCards.length >= 3 ? heroCards.slice(0, 3) : destaques.items.slice(0, 3);

  return {
    categories,
    brands,
    hero,
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
