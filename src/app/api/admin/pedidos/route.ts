import { NextResponse } from 'next/server';
import { z } from 'zod';
import { changeOrderStatus } from '@/core/application/order-service';
import { requireAdmin } from '@/lib/auth';

export const runtime = 'nodejs';

const schema = z.object({
  id: z.string().min(1),
  status: z.enum(['aguardando-pagamento', 'pago', 'separando', 'enviado', 'entregue', 'cancelado']),
});

export async function PATCH(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ ok: false, message: 'Acesso restrito.' }, { status: 403 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: 'Requisição inválida.' }, { status: 400 });
  }

  const order = await changeOrderStatus(parsed.data.id, parsed.data.status);
  if (!order) {
    return NextResponse.json({ ok: false, message: 'Pedido não encontrado.' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, order });
}
