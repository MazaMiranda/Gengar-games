import type { MediaItem, Product } from '@/core/domain/entities';
import { hashString } from '@/lib/utils';
import tcgdexImages from './tcgdex-images.json';

/**
 * Artes reais resolvidas na TCGdex por `npm run tcgdex:backfill`. O script só
 * grava URLs que responderam 200, então o que está aqui pode ser renderizado
 * direto. Slug ausente = carta cai na arte procedural do ProductVisual.
 */
const REAL_ART: Record<string, string> = tcgdexImages.cards;

type Draft = Pick<Product, 'slug' | 'name' | 'subtitle' | 'type' | 'categorySlug' | 'brandSlug' | 'price'> &
  Partial<Omit<Product, 'slug' | 'name' | 'subtitle' | 'type' | 'categorySlug' | 'brandSlug' | 'price'>>;

const TYPE_PREFIX: Record<Product['type'], string> = {
  'tcg-card': 'CRD',
  'tcg-sealed': 'SLD',
  console: 'CSL',
  game: 'GAM',
  accessory: 'ACC',
  collectible: 'COL',
};

function defaultMedia(draft: Draft): MediaItem[] {
  const real = REAL_ART[draft.slug];

  // Com arte real da TCGdex, ela é a primeira mídia (a que aparece no card e
  // abre a galeria); as composições procedurais seguem como ângulos extras.
  const base: MediaItem[] = real
    ? [{ id: `${draft.slug}-tcgdex`, kind: 'image', label: 'Frente', src: real }]
    : [{ id: `${draft.slug}-a`, kind: 'art', label: 'Frente' }];

  base.push(
    { id: `${draft.slug}-b`, kind: 'art', label: 'Detalhe' },
    { id: `${draft.slug}-c`, kind: 'art', label: 'Verso' },
  );

  if (draft.type === 'console' || draft.type === 'accessory') {
    base.push({ id: `${draft.slug}-d`, kind: 'art', label: 'Conteúdo da caixa' });
  }
  return base;
}

/**
 * Completa um rascunho de produto com os campos derivados.
 * Mantém os dados de catálogo enxutos sem abrir mão de realismo (SKU, estoque,
 * reputação e mídia são estáveis entre builds porque derivam do slug).
 */
export function defineProduct(draft: Draft): Product {
  const seed = hashString(draft.slug);
  const rating = draft.rating ?? Number((4.2 + ((seed % 8) / 10)).toFixed(1));

  return {
    id: draft.id ?? `p_${seed.toString(36)}`,
    slug: draft.slug,
    name: draft.name,
    subtitle: draft.subtitle,
    type: draft.type,
    categorySlug: draft.categorySlug,
    brandSlug: draft.brandSlug,
    price: draft.price,
    compareAtPrice: draft.compareAtPrice ?? null,
    stock: draft.stock ?? 2 + (seed % 17),
    sku: draft.sku ?? `GG-${TYPE_PREFIX[draft.type]}-${seed.toString(36).slice(0, 6).toUpperCase()}`,
    rating: Math.min(5, rating),
    reviewCount: draft.reviewCount ?? 6 + (seed % 184),
    soldCount: draft.soldCount ?? 18 + (seed % 940),
    condition: draft.condition ?? (draft.type === 'tcg-card' ? 'novo' : 'lacrado'),
    platform: draft.platform,
    tcg: draft.tcg ?? draft.card?.game,
    accent: draft.accent ?? 265,
    description: draft.description ?? draft.subtitle,
    highlights: draft.highlights ?? [],
    specs: draft.specs ?? [],
    media: draft.media ?? defaultMedia(draft),
    tags: draft.tags ?? [],
    releasedAt: draft.releasedAt ?? '2024-01-01',
    featured: draft.featured ?? false,
    preOrder: draft.preOrder ?? false,
    card: draft.card,
    console: draft.console,
    relatedSlugs: draft.relatedSlugs ?? [],
  };
}

export function defineAll(drafts: Draft[]): Product[] {
  return drafts.map(defineProduct);
}
