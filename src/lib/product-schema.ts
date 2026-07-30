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
    slug: z
      .string()
      .min(2, 'Informe o slug.')
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use apenas minúsculas, números e hífens.'),
    subtitle: z.string().min(2, 'Informe o subtítulo.'),
    sku: z.string().min(2, 'Informe o SKU.'),
    type: enumOf<ProductType>(PRODUCT_TYPES),
    categorySlug: z.string().min(1, 'Escolha a categoria.'),
    brandSlug: z.string().min(1, 'Escolha a marca.'),
    // Centavos, como todo valor monetário do domínio.
    price: z.number().int().positive('Preço deve ser maior que zero.'),
    compareAtPrice: z.number().int().positive().nullable(),
    stock: z.number().int().min(0, 'Estoque não pode ser negativo.'),
    condition: enumOf<ProductCondition>(CONDITIONS),
    description: z.string().min(10, 'Descreva o produto em ao menos 10 caracteres.'),
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
  });

export type ProductDraft = z.infer<typeof productDraftSchema>;
export type CardDraft = z.infer<typeof cardDraftSchema>;

/** Sugere um slug a partir do nome, sem acentos e sem pontuação. */
export function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
