import { NextResponse } from 'next/server';
import { z } from 'zod';
import { lookupTcgdexCard, parseLocalId } from '@/infrastructure/tcgdex/client';
import { requireAdmin } from '@/lib/auth';

export const runtime = 'nodejs';

const schema = z.object({
  name: z.string().min(1),
  number: z.string().min(1),
  set: z.string().optional(),
});

/**
 * Pré-visualização usada só pelo formulário de cadastro — deixa o operador
 * conferir a arte antes de salvar. A busca definitiva roda de novo no servidor
 * na hora do POST /api/admin/produtos, sem confiar no que o cliente devolveu aqui.
 */
export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ ok: false, message: 'Acesso restrito.' }, { status: 403 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: 'Requisição inválida.' }, { status: 400 });
  }

  const match = await lookupTcgdexCard({
    name: parsed.data.name,
    localId: parseLocalId(parsed.data.number),
    setName: parsed.data.set,
  });

  if (!match) {
    return NextResponse.json({ ok: false, message: 'Carta não encontrada na TCGdex.' });
  }

  return NextResponse.json({ ok: true, match });
}
