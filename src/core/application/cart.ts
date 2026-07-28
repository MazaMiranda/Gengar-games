import type { Coupon, Money, ProductType } from '../domain/entities';

export const FREE_SHIPPING_THRESHOLD = 29900;

export interface CartLine {
  slug: string;
  name: string;
  subtitle: string;
  price: Money;
  compareAtPrice: Money | null;
  quantity: number;
  accent: number;
  type: ProductType;
  stock: number;
}

export interface CartTotals {
  subtotal: Money;
  discount: Money;
  shipping: Money;
  total: Money;
  itemCount: number;
  savings: Money;
  freeShippingRemaining: Money;
  freeShippingProgress: number;
}

export type CouponRejection =
  | 'nao-encontrado'
  | 'expirado'
  | 'inativo'
  | 'limite-atingido'
  | 'subtotal-insuficiente';

export interface CouponEvaluation {
  valid: boolean;
  reason?: CouponRejection;
  message: string;
  discount: Money;
  freeShipping: boolean;
}

export function subtotalOf(lines: CartLine[]): Money {
  return lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
}

export function savingsOf(lines: CartLine[]): Money {
  return lines.reduce(
    (sum, line) => sum + Math.max(0, (line.compareAtPrice ?? line.price) - line.price) * line.quantity,
    0,
  );
}

export function evaluateCoupon(coupon: Coupon | null, subtotal: Money): CouponEvaluation {
  const none = (reason: CouponRejection, message: string): CouponEvaluation => ({
    valid: false,
    reason,
    message,
    discount: 0,
    freeShipping: false,
  });

  if (!coupon) return none('nao-encontrado', 'Cupom não encontrado.');
  if (!coupon.active) return none('inativo', 'Este cupom não está mais ativo.');
  if (new Date(coupon.expiresAt) < new Date()) return none('expirado', 'Este cupom expirou.');
  if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) {
    return none('limite-atingido', 'Este cupom atingiu o limite de uso.');
  }
  if (subtotal < coupon.minSubtotal) {
    return none(
      'subtotal-insuficiente',
      `Válido em compras a partir de ${(coupon.minSubtotal / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })}.`,
    );
  }

  if (coupon.type === 'shipping') {
    return { valid: true, message: 'Frete grátis aplicado.', discount: 0, freeShipping: true };
  }

  const discount =
    coupon.type === 'percent'
      ? Math.round((subtotal * coupon.value) / 100)
      : Math.min(coupon.value, subtotal);

  return {
    valid: true,
    message: `Cupom ${coupon.code} aplicado.`,
    discount,
    freeShipping: false,
  };
}

/**
 * Totais a partir de um desconto já apurado — usado no cliente, onde o cupom é
 * validado pelo servidor e só o resultado trafega de volta.
 */
export function totalsFrom(
  lines: CartLine[],
  options: { discount?: Money; freeShipping?: boolean; shipping?: Money } = {},
): CartTotals {
  const subtotal = subtotalOf(lines);
  const qualifiesFreeShipping =
    subtotal >= FREE_SHIPPING_THRESHOLD || Boolean(options.freeShipping) || !lines.length;
  const shipping = qualifiesFreeShipping ? 0 : (options.shipping ?? 0);
  const discount = Math.min(options.discount ?? 0, subtotal);

  return {
    subtotal,
    discount,
    shipping,
    total: Math.max(0, subtotal - discount) + shipping,
    itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
    savings: savingsOf(lines) + discount,
    freeShippingRemaining: Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal),
    freeShippingProgress: Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100)),
  };
}

/** Totais no servidor, onde o cupom completo está disponível. */
export function computeTotals(
  lines: CartLine[],
  options: { coupon?: Coupon | null; shipping?: Money } = {},
): CartTotals {
  const evaluation = evaluateCoupon(options.coupon ?? null, subtotalOf(lines));
  return totalsFrom(lines, {
    discount: evaluation.valid ? evaluation.discount : 0,
    freeShipping: evaluation.freeShipping,
    shipping: options.shipping,
  });
}
