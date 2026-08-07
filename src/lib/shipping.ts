import type { ShippingOption } from '@/core/domain/entities';
import { CIDADE_UF } from '@/lib/loja';

/** Tabela de frete exposta ao cliente (carrinho e checkout). */
export const shippingOptions: ShippingOption[] = [
  { id: 'sedex', name: 'SEDEX', carrier: 'Correios', price: 3490, etaDays: [2, 4] },
  { id: 'pac', name: 'PAC', carrier: 'Correios', price: 1990, etaDays: [6, 11] },
  { id: 'express', name: 'Gengar Express', carrier: 'Loggi', price: 4990, etaDays: [1, 2] },
  { id: 'retirada', name: 'Retirar na loja', carrier: CIDADE_UF, price: 0, etaDays: [0, 1] },
];

export function shippingOptionById(id: string) {
  return shippingOptions.find((option) => option.id === id) ?? shippingOptions[0]!;
}

export function etaLabel(option: ShippingOption) {
  const [min, max] = option.etaDays;
  if (max === 0) return 'Disponível hoje';
  if (min === 0) return `Em até ${max} dia útil`;
  return `${min} a ${max} dias úteis`;
}
