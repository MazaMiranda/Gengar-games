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

export function computeTotals(
  lines: CartLine[],
  options: { coupon?: Coupon | null; shipping?: Money } = {},
): CartTotals {
  const subtotal = subtotalOf(lines);
  const baseShipping = options.shipping ?? 0;
  const evaluation = evaluateCoupon(options.coupon ?? null, subtotal);

  const qualifiesFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD || evaluation.freeShipping;
  const shipping = qualifiesFreeShipping ? 0 : baseShipping;
  const discount = evaluation.valid ? evaluation.discount : 0;

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
