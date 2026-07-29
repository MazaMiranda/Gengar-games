import { getRepositories } from '@/infrastructure/container';
import type { ProductDraft } from '@/lib/product-schema';
import type { Product } from '../domain/entities';

export type CreateProductResult =
  | { ok: true; product: Product }
  | { ok: false; field?: keyof ProductDraft; message: string };

/** Matiz estável derivada do slug — mesma ideia usada na arte gerada do card. */
function accentFor(slug: string) {
  let hash = 0;
  for (const char of slug) hash = (hash * 31 + char.charCodeAt(0)) % 360;
  return hash;
}

/**
 * Cadastra um produto. O rascunho já chega validado pelo schema; aqui ficam as
 * regras que dependem do catálogo — unicidade de slug e de SKU — e o
 * preenchimento dos campos derivados que o formulário não pede.
 */
export async function createProduct(draft: ProductDraft): Promise<CreateProductResult> {
  const { products } = await getRepositories();

  if (await products.findBySlug(draft.slug)) {
    return { ok: false, field: 'slug', message: 'Já existe um produto com este slug.' };
  }

  // A busca textual não indexa SKU, então a unicidade é conferida sobre o
  // catálogo inteiro — que ambos os repositórios já carregam para consultar.
  const all = await products.search({ perPage: Number.MAX_SAFE_INTEGER });
  const sku = draft.sku.trim().toLowerCase();
  if (all.items.some((item) => item.sku.toLowerCase() === sku)) {
    return { ok: false, field: 'sku', message: 'Já existe um produto com este SKU.' };
  }

  const product: Product = {
    id: crypto.randomUUID(),
    slug: draft.slug,
    name: draft.name,
    subtitle: draft.subtitle,
    type: draft.type,
    categorySlug: draft.categorySlug,
    brandSlug: draft.brandSlug,
    price: draft.price,
    compareAtPrice: draft.compareAtPrice,
    stock: draft.stock,
    sku: draft.sku,
    // Produto recém-cadastrado ainda não tem reputação nem histórico.
    rating: 0,
    reviewCount: 0,
    soldCount: 0,
    condition: draft.condition,
    tcg: draft.card?.game,
    accent: accentFor(draft.slug),
    description: draft.description,
    highlights: [],
    specs: [],
    media: [],
    tags: draft.tags,
    releasedAt: new Date().toISOString().slice(0, 10),
    featured: draft.featured,
    preOrder: draft.preOrder,
    // O formulário representa "sem HP" como null; o domínio, como ausente.
    card: draft.card ? { ...draft.card, hp: draft.card.hp ?? undefined } : undefined,
    relatedSlugs: [],
  };

  return { ok: true, product: await products.create(product) };
}
