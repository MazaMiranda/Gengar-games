import { z } from 'zod';
import type {
  CardGrade,
  CardLanguage,
  CardRarity,
  ProductCondition,
  ProductType,
  TcgGame,
} from '@/core/domain/entities';
import {
  CARD_GRADES,
  CONDITIONS,
  PRODUCT_TYPES,
  RARITIES,
  TCG_GAMES,
} from '@/core/domain/taxonomy';

/** Deriva o enum do Zod da própria taxonomia — uma lista só para manter. */
function enumOf<T extends string>(source: Record<T, unknown>) {
  return z.enum(Object.keys(source) as [T, ...T[]]);
}

const LANGUAGES: CardLanguage[] = ['português', 'inglês', 'japonês'];

export const cardDraftSchema = z.object({
  game: enumOf<TcgGame>(TCG_GAMES),
  /**
   * Id exato da carta na TCGdex, quando escolhida pelo seletor visual. Com ele
   * o servidor busca aquela impressão específica em vez de re-resolver por
   * nome — o mesmo Charizard existe em dezenas de coleções.
   */
  tcgdexId: z.string().optional(),
  set: z.string().min(2, 'Informe a coleção.'),
  setCode: z.string().min(1, 'Informe o código da coleção.'),
  number: z.string().min(1, 'Informe o número da carta.'),
  rarity: enumOf<CardRarity>(RARITIES),
  language: z.enum(LANGUAGES as [CardLanguage, ...CardLanguage[]]),
  cardType: z.string().min(2, 'Informe o tipo da carta.'),
  hp: z.number().int().positive().nullable(),
  illustrator: z.string().min(2, 'Informe o ilustrador.'),
  foil: z.boolean(),
  /** A escala de conservação: NM, SP, MP ou D. */
  grade: enumOf<CardGrade>(CARD_GRADES),
});

export const productDraftSchema = z
  .object({
    name: z.string().min(2, 'Informe o nome.'),
    /*
     * Slug e SKU saíram do formulário: são derivações puras do nome (mais
     * coleção e número, no caso de carta), então pedir ao operador só criava
     * chance de digitar errado. Continuam aceitos aqui porque o servidor
     * preenche antes de validar — ver `createProduct`.
     */
    slug: z
      .string()
      .min(2)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use apenas minúsculas, números e hífens.')
      .optional(),
    sku: z.string().min(2).optional(),
    /*
     * Para carta, estes três vêm da TCGdex e do catálogo Pokémon; para os
     * demais produtos não há de onde derivar, então o formulário continua
     * pedindo (ver o refine no fim).
     */
    subtitle: z.string().min(2, 'Informe o subtítulo.').optional(),
    description: z.string().min(10, 'Descreva o produto em ao menos 10 caracteres.').optional(),
    brandSlug: z.string().min(1, 'Escolha a marca.').optional(),
    type: enumOf<ProductType>(PRODUCT_TYPES),
    categorySlug: z.string().min(1, 'Escolha a categoria.'),
    // Centavos, como todo valor monetário do domínio.
    price: z.number().int().positive('Preço deve ser maior que zero.'),
    compareAtPrice: z.number().int().positive().nullable(),
    stock: z.number().int().min(0, 'Estoque não pode ser negativo.'),
    condition: enumOf<ProductCondition>(CONDITIONS),
    tags: z.array(z.string()),
    featured: z.boolean(),
    preOrder: z.boolean(),
    card: cardDraftSchema.nullable(),
  })
  .refine((draft) => draft.type !== 'tcg-card' || draft.card !== null, {
    message: 'Carta avulsa exige a ficha da carta.',
    path: ['card'],
  })
  .refine((draft) => draft.compareAtPrice === null || draft.compareAtPrice > draft.price, {
    message: 'O preço antigo precisa ser maior que o preço atual.',
    path: ['compareAtPrice'],
  })
  .refine((draft) => draft.type === 'tcg-card' || Boolean(draft.subtitle), {
    message: 'Informe o subtítulo.',
    path: ['subtitle'],
  })
  .refine((draft) => draft.type === 'tcg-card' || Boolean(draft.description), {
    message: 'Descreva o produto.',
    path: ['description'],
  })
  .refine((draft) => draft.type === 'tcg-card' || Boolean(draft.brandSlug), {
    message: 'Escolha a marca.',
    path: ['brandSlug'],
  });

export type ProductDraft = z.infer<typeof productDraftSchema>;
export type CardDraft = z.infer<typeof cardDraftSchema>;

/**
 * Traduz a raridade da TCGdex para a escala do catálogo.
 *
 * O campo lá é texto livre e varia com o idioma ("Rare Holo", "Ultra Rare",
 * "Illustration rare", "Incomum"...), então a checagem é por trecho. A ordem
 * importa: "incomum" contém "comum" e "ultra rara" contém "rara".
 */
export function mapTcgdexRarity(raw: string | null | undefined): CardRarity {
  if (!raw) return 'rara';
  const value = raw
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

  if (value.includes('secret')) return 'secreta';
  if (value.includes('ultra') || value.includes('special illustration')) return 'ultra-rara';
  if (value.includes('incomum') || value.includes('uncommon')) return 'incomum';
  if (value.includes('comum') || value.includes('common')) return 'comum';
  if (value.includes('rar')) return 'rara';
  return 'rara';
}

/** Sugere um slug a partir do nome, sem acentos e sem pontuação. */
export function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
