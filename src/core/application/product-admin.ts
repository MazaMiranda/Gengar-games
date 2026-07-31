import { getRepositories } from '@/infrastructure/container';
import { lookupTcgdexCard, parseLocalId } from '@/infrastructure/tcgdex/client';
import type { ProductDraft } from '@/lib/product-schema';
import type { CardAttributes, MediaItem, Product } from '../domain/entities';

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
 * Busca a arte da carta na TCGdex e devolve pronta para `product.media`.
 * Sem correspondência, API fora do ar ou imagem que não responde 200 no HEAD,
 * devolve array vazio — mesmo critério do script `tcgdex:backfill`: um link
 * quebrado renderizaria uma imagem falha, pior que a arte procedural da loja.
 */
async function resolveTcgdexMedia(name: string, card: Pick<CardAttributes, 'number' | 'set'>): Promise<MediaItem[]> {
  const match = await lookupTcgdexCard({
    name,
    localId: parseLocalId(card.number),
    setName: card.set,
  });
  if (!match?.imageUrl) return [];

  const head = await fetch(match.imageUrl, { method: 'HEAD' }).catch(() => null);
  if (!head?.ok) return [];

  return [{ id: match.id, kind: 'image', label: `${match.name} — TCGdex`, src: match.imageUrl }];
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

  // Carta avulsa: busca a arte real na TCGdex a partir de nome + número. Sem
  // correspondência (ou API fora do ar), o produto ainda é criado — a arte
  // procedural do ProductVisual assume, exatamente como hoje.
  const media: MediaItem[] =
    draft.type === 'tcg-card' && draft.card ? await resolveTcgdexMedia(draft.name, draft.card) : [];

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
    media,
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

export interface TcgdexSyncEntry {
  slug: string;
  name: string;
  status: 'atualizado' | 'nao-encontrado';
}

export interface TcgdexSyncResult {
  verificados: number;
  atualizados: number;
  entradas: TcgdexSyncEntry[];
}

/**
 * Preenche a arte real de cartas já cadastradas que ainda estão com a arte
 * procedural — o mesmo lookup que o cadastro roda sozinho para produto novo,
 * aplicado uma vez ao catálogo existente. Complementa `npm run tcgdex:backfill`
 * (que resolve o catálogo seed, escrevendo em tcgdex-images.json e exigindo
 * rebuild): este caminho atualiza o produto já em memória/no banco, sem
 * redeploy — cobre o que a seed ainda não tinha e o que foi cadastrado depois.
 *
 * Nunca sobrescreve uma foto real que já exista: o critério é o mesmo do
 * catalog-builder — media[0].kind === 'image' já é foto, o resto é procedural.
 */
export async function syncTcgdexArt(): Promise<TcgdexSyncResult> {
  const { products } = await getRepositories();
  const catalog = await products.search({ types: ['tcg-card'], perPage: Number.MAX_SAFE_INTEGER });
  const pendentes = catalog.items.filter((product) => product.card && product.media[0]?.kind !== 'image');

  const entradas: TcgdexSyncEntry[] = [];
  for (const product of pendentes) {
    const [primary] = await resolveTcgdexMedia(product.name, product.card!);
    if (primary) {
      // O primeiro slot é sempre "Frente" (real ou procedural); os ângulos
      // extras (Detalhe, Verso...) que já existiam continuam do jeito que
      // estavam — só a capa troca.
      await products.updateMedia(product.slug, [primary, ...product.media.slice(1)]);
      entradas.push({ slug: product.slug, name: product.name, status: 'atualizado' });
    } else {
      entradas.push({ slug: product.slug, name: product.name, status: 'nao-encontrado' });
    }
  }

  return {
    verificados: pendentes.length,
    atualizados: entradas.filter((e) => e.status === 'atualizado').length,
    entradas,
  };
}
