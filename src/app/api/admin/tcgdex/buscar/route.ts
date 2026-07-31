import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getTcgdexCard, searchTcgdexCards } from '@/infrastructure/tcgdex/client';
import { requireAdmin } from '@/lib/auth';

export const runtime = 'nodejs';

const schema = z.object({
  /** Busca por nome — alimenta a grade de escolha. */
  name: z.string().min(2).optional(),
  /** Detalhe de uma carta específica — usado quando o operador escolhe uma. */
  id: z.string().min(1).optional(),
});

/**
 * Seletor visual de cartas do cadastro administrativo. Duas operações no mesmo
 * endpoint porque são o mesmo passo da mesma tela: listar candidatas e, ao
 * clicar numa, trazer a ficha completa dela.
 *
 * Não confunda com a busca da loja: isto só existe atrás de sessão de
 * administrador. O cliente final continua enxergando apenas o catálogo já
 * cadastrado.
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

  if (parsed.data.id) {
    const match = await getTcgdexCard(parsed.data.id);
    if (!match) {
      return NextResponse.json({ ok: false, message: 'Não foi possível carregar esta carta.' });
    }
    return NextResponse.json({ ok: true, match });
  }

  if (!parsed.data.name) {
    return NextResponse.json({ ok: false, message: 'Informe o nome da carta.' }, { status: 400 });
  }

  const results = await searchTcgdexCards(parsed.data.name);
  return NextResponse.json({ ok: true, results });
}
