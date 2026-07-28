import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

/** Formata centavos inteiros como moeda brasileira. */
export function formatPrice(cents: number) {
  return BRL.format(cents / 100);
}

/** Divide o preço em partes para composições tipográficas (R$ / 1.299 / ,90). */
export function splitPrice(cents: number) {
  const [amount, fraction] = BRL.format(cents / 100).replace('R$', '').trim().split(',');
  return { symbol: 'R$', amount: amount ?? '0', fraction: fraction ?? '00' };
}

/** Maior parcela sem juros dentro do valor mínimo por parcela. */
export function installmentsFor(cents: number, max = 12, minPerInstallment = 2000) {
  const count = Math.max(1, Math.min(max, Math.floor(cents / minPerInstallment)));
  return { count, value: Math.round(cents / count) };
}

export function discountPercent(price: number, compareAt?: number | null) {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function formatDate(value: string | Date, opts?: Intl.DateTimeFormatOptions) {
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat('pt-BR', opts ?? { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

export function formatCompact(value: number) {
  return new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

/** Hash determinístico — usado para gerar arte procedural estável por produto. */
export function hashString(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

export function pluralize(count: number, singular: string, plural: string) {
  return count === 1 ? singular : plural;
}
