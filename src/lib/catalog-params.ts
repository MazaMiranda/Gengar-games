import type {
  CardGrade,
  CardLanguage,
  CardRarity,
  GamingPlatform,
  ProductCondition,
  ProductType,
  TcgGame,
} from '@/core/domain/entities';
import type { CatalogQuery, CatalogSort } from '@/core/ports/repositories';

export type SearchParamsInput = Record<string, string | string[] | undefined>;

export const SORT_OPTIONS: { value: CatalogSort; label: string }[] = [
  { value: 'relevancia', label: 'Mais relevantes' },
  { value: 'mais-vendidos', label: 'Mais vendidos' },
  { value: 'lancamentos', label: 'Lançamentos' },
  { value: 'menor-preco', label: 'Menor preço' },
  { value: 'maior-preco', label: 'Maior preço' },
  { value: 'avaliacao', label: 'Melhor avaliados' },
];

/** Nomes dos parâmetros na URL — em português, estáveis para SEO. */
export const PARAM = {
  search: 'busca',
  category: 'categoria',
  brand: 'marca',
  platform: 'plataforma',
  tcg: 'tcg',
  set: 'colecao',
  rarity: 'raridade',
  language: 'idioma',
  // 'estado' já nomeia a condição do produto (lacrado/novo/usado); a
  // conservação da carta é uma escala própria e precisa de chave distinta.
  grade: 'conservacao',
  condition: 'estado',
  type: 'tipo',
  tag: 'tag',
  minPrice: 'preco_min',
  maxPrice: 'preco_max',
  inStock: 'estoque',
  onSale: 'promocao',
  sort: 'ordenar',
  page: 'pagina',
} as const;

function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return (Array.isArray(value) ? value : [value]).flatMap((item) => item.split(',')).filter(Boolean);
}

function toNumber(value: string | string[] | undefined): number | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseCatalogParams(params: SearchParamsInput, perPage = 12): CatalogQuery {
  return {
    search: first(params[PARAM.search])?.trim() || undefined,
    categories: toArray(params[PARAM.category]),
    brands: toArray(params[PARAM.brand]),
    platforms: toArray(params[PARAM.platform]) as GamingPlatform[],
    tcgs: toArray(params[PARAM.tcg]) as TcgGame[],
    sets: toArray(params[PARAM.set]),
    rarities: toArray(params[PARAM.rarity]) as CardRarity[],
    languages: toArray(params[PARAM.language]) as CardLanguage[],
    grades: toArray(params[PARAM.grade]) as CardGrade[],
    conditions: toArray(params[PARAM.condition]) as ProductCondition[],
    types: toArray(params[PARAM.type]) as ProductType[],
    tags: toArray(params[PARAM.tag]),
    minPrice: toNumber(params[PARAM.minPrice]),
    maxPrice: toNumber(params[PARAM.maxPrice]),
    inStock: first(params[PARAM.inStock]) === '1',
    onSale: first(params[PARAM.onSale]) === '1',
    sort: (first(params[PARAM.sort]) as CatalogSort) || 'relevancia',
    page: toNumber(params[PARAM.page]) ?? 1,
    perPage,
  };
}

/** Alterna um valor dentro de um filtro multivalorado, preservando o resto da URL. */
export function toggleParam(current: URLSearchParams, key: string, value: string) {
  const next = new URLSearchParams(current.toString());
  const values = next.getAll(key);

  next.delete(key);
  const updated = values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
  updated.forEach((item) => next.append(key, item));
  next.delete(PARAM.page);

  return next;
}

export function setParam(current: URLSearchParams, key: string, value?: string | null) {
  const next = new URLSearchParams(current.toString());
  if (value === undefined || value === null || value === '') next.delete(key);
  else next.set(key, value);
  if (key !== PARAM.page) next.delete(PARAM.page);
  return next;
}

export const FILTER_KEYS = [
  PARAM.category,
  PARAM.brand,
  PARAM.platform,
  PARAM.tcg,
  PARAM.set,
  PARAM.rarity,
  PARAM.language,
  PARAM.grade,
  PARAM.condition,
  PARAM.type,
  PARAM.tag,
  PARAM.minPrice,
  PARAM.maxPrice,
  PARAM.inStock,
  PARAM.onSale,
  PARAM.search,
] as const;

export function countActiveFilters(params: URLSearchParams) {
  return FILTER_KEYS.reduce((total, key) => total + params.getAll(key).filter(Boolean).length, 0);
}
