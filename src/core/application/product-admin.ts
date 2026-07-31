import { getRepositories } from '@/infrastructure/container';
import { getTcgdexCard, lookupTcgdexCard, parseLocalId } from '@/infrastructure/tcgdex/client';
import { slugify, type ProductDraft } from '@/lib/product-schema';
import { hashString } from '@/lib/utils';
import { CARD_GRADES, RARITIES } from '../domain/taxonomy';
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
 *
 * Com `tcgdexId` (carta veio do seletor visual), busca aquela impressão exata;
 * sem ele, resolve por nome + número + coleção, como no backfill.
 */
async function resolveTcgdexMedia(
  name: string,
  card: Pick<CardAttributes, 'number' | 'set'> & { tcgdexId?: string },
): Promise<MediaItem[]> {
  const match = card.tcgdexId
    ? await getTcgdexCard(card.tcgdexId)
    : await lookupTcgdexCard({ name, localId: parseLocalId(card.number), setName: card.set });

  if (!match?.imageUrl) return [];

  const head = await fetch(match.imageUrl, { method: 'HEAD' }).catch(() => null);
  if (!head?.ok) return [];

  return [{ id: match.id, kind: 'image', label: `${match.name} — TCGdex`, src: match.imageUrl }];
}

const TYPE_PREFIX: Record<Product['type'], string> = {
  'tcg-card': 'CRD',
  'tcg-sealed': 'SLD',
  console: 'CSL',
  game: 'GAM',
  accessory: 'ACC',
  collectible: 'COL',
};

/** Acrescenta -2, -3... enquanto o valor já existir no catálogo. */
function makeUnique(base: string, taken: Set<string>) {
  if (!taken.has(base)) return base;
  let suffix = 2;
  while (taken.has(`${base}-${suffix}`)) suffix++;
  return `${base}-${suffix}`;
}

/**
 * Preenche o que saiu do formulário.
 *
 * Slug e SKU são derivações puras — pedi-los ao operador só criava chance de
 * erro de digitação. Para carta, subtítulo, descrição e marca também saem
 * prontos da própria ficha: numa loja só de Pokémon, a marca é sempre a mesma
 * e o resto está na carta. Duplicidade de slug/SKU não é erro: a mesma carta
 * pode ser cadastrada duas vezes em estados diferentes, então desambiguamos
 * com sufixo em vez de recusar.
 */
function derive(draft: ProductDraft, existing: Product[]) {
  const card = draft.card;

  const baseSlug = card
    ? slugify(`${draft.name} ${card.setCode} ${card.number}`)
    : slugify(draft.name);
  const slug = makeUnique(baseSlug || 'produto', new Set(existing.map((p) => p.slug)));

  const baseSku = `GG-${TYPE_PREFIX[draft.type]}-${hashString(slug).toString(36).slice(0, 6).toUpperCase()}`;
  const sku = makeUnique(baseSku, new Set(existing.map((p) => p.sku)));

  const subtitle =
    draft.subtitle ??
    (card ? `${RARITIES[card.rarity].name} · ${card.set} ${card.number}` : draft.name);

  const description =
    draft.description ??
    (card
      ? `${draft.name} — ${card.cardType}, ${RARITIES[card.rarity].name} da coleção ${card.set} (${card.number}). ` +
        `Idioma ${card.language}, estado ${card.grade} (${CARD_GRADES[card.grade].name}).`
      : subtitle);

  // Carta de Pokémon TCG só tem uma editora; os demais produtos escolhem no formulário.
  const brandSlug = draft.brandSlug ?? (card ? 'the-pokemon-company' : 'gengar-games');

  return { slug, sku, subtitle, description, brandSlug };
}

/**
 * Cadastra um produto. O rascunho já chega validado pelo schema; aqui ficam o
 * preenchimento dos campos derivados que o formulário não pede mais e a busca
 * da arte oficial da carta.
 */
export async function createProduct(draft: ProductDraft): Promise<CreateProductResult> {
  const { products } = await getRepositories();

  // Ambos os repositórios já carregam o catálogo inteiro para consultar, e
  // precisamos dele para garantir slug e SKU únicos.
  const all = await products.search({ perPage: Number.MAX_SAFE_INTEGER });
  const { slug, sku, subtitle, description, brandSlug } = derive(draft, all.items);

  // Carta avulsa: busca a arte real na TCGdex. Sem correspondência (ou API
  // fora do ar), o produto ainda é criado — a arte procedural do ProductVisual
  // assume, exatamente como hoje.
  const media: MediaItem[] =
    draft.type === 'tcg-card' && draft.card ? await resolveTcgdexMedia(draft.name, draft.card) : [];

  // tcgdexId é rastro da origem (serviu para achar a arte exata) e não faz
  // parte da ficha que a loja exibe; o domínio não o conhece.
  let card: CardAttributes | undefined;
  if (draft.card) {
    const { tcgdexId: _origem, hp, ...ficha } = draft.card;
    card = { ...ficha, hp: hp ?? undefined };
  }

  const product: Product = {
    id: crypto.randomUUID(),
    slug,
    name: draft.name,
    subtitle,
    type: draft.type,
    categorySlug: draft.categorySlug,
    brandSlug,
    price: draft.price,
    compareAtPrice: draft.compareAtPrice,
    stock: draft.stock,
    sku,
    // Produto recém-cadastrado ainda não tem reputação nem histórico.
    rating: 0,
    reviewCount: 0,
    soldCount: 0,
    condition: draft.condition,
    tcg: draft.card?.game,
    accent: accentFor(slug),
    description,
    highlights: [],
    specs: [],
    media,
    tags: draft.tags,
    releasedAt: new Date().toISOString().slice(0, 10),
    featured: draft.featured,
    preOrder: draft.preOrder,
    card,
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
