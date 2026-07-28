import { NextResponse } from 'next/server';
import { z } from 'zod';
import { evaluateCoupon } from '@/core/application/cart';
import { getRepositories } from '@/infrastructure/container';

export const runtime = 'nodejs';

const schema = z.object({
  code: z.string().min(3).max(32),
  subtotal: z.number().int().nonnegative(),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      { valid: false, message: 'Requisição inválida.', discount: 0, freeShipping: false },
      { status: 400 },
    );
  }

  const { coupons } = await getRepositories();
  const coupon = await coupons.findByCode(parsed.data.code);
  const evaluation = evaluateCoupon(coupon, parsed.data.subtotal);

  return NextResponse.json({
    ...evaluation,
    code: coupon?.code ?? parsed.data.code.toUpperCase(),
    description: coupon?.description ?? null,
  });
}
