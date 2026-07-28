'use client';

import { useQuery } from '@tanstack/react-query';
import { subtotalOf, totalsFrom } from '@/core/application/cart';
import { useCartStore } from '@/stores/cart-store';
import { shippingOptionById } from '@/lib/shipping';

interface CouponResponse {
  valid: boolean;
  message: string;
  discount: number;
  freeShipping: boolean;
  code: string;
  description: string | null;
}

async function validateCoupon(code: string, subtotal: number): Promise<CouponResponse> {
  const response = await fetch('/api/cart/coupon', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, subtotal }),
  });
  return response.json();
}

/**
 * Totais do carrinho com o cupom revalidado no servidor sempre que o subtotal
 * muda — o cliente nunca decide o valor do desconto.
 */
export function useCartTotals() {
  const lines = useCartStore((state) => state.lines);
  const couponCode = useCartStore((state) => state.couponCode);
  const shippingOptionId = useCartStore((state) => state.shippingOptionId);

  const subtotal = subtotalOf(lines);
  const shipping = shippingOptionById(shippingOptionId).price;

  const { data: coupon, isFetching: validatingCoupon } = useQuery({
    queryKey: ['coupon', couponCode, subtotal],
    queryFn: () => validateCoupon(couponCode!, subtotal),
    enabled: Boolean(couponCode) && lines.length > 0,
    staleTime: 30_000,
  });

  const totals = totalsFrom(lines, {
    discount: coupon?.valid ? coupon.discount : 0,
    freeShipping: coupon?.valid ? coupon.freeShipping : false,
    shipping,
  });

  return { totals, coupon: coupon ?? null, validatingCoupon, lines };
}
