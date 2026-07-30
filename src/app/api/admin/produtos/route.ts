import { NextResponse } from 'next/server';
import { createProduct } from '@/core/application/product-admin';
import { requireAdmin } from '@/lib/auth';
import { productDraftSchema } from '@/lib/product-schema';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ ok: false, message: 'Acesso restrito.' }, { status: 403 });
  }

  const parsed = productDraftSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json(
      { ok: false, field: issue?.path[0], message: issue?.message ?? 'Requisição inválida.' },
      { status: 400 },
    );
  }

  const result = await createProduct(parsed.data);
  if (!result.ok) {
    return NextResponse.json(result, { status: 409 });
  }

  return NextResponse.json({ ok: true, product: result.product }, { status: 201 });
}
