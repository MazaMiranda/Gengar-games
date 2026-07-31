import { NextResponse } from 'next/server';
import { syncTcgdexArt } from '@/core/application/product-admin';
import { requireAdmin } from '@/lib/auth';

export const runtime = 'nodejs';
// Percorre o catálogo inteiro chamando a TCGdex uma vez por carta pendente —
// pode passar bem do limite padrão de execução numa Vercel Function comum.
export const maxDuration = 120;

/**
 * Preenche a arte real das cartas já cadastradas que ainda estão com a arte
 * procedural. Idempotente: rodar de novo só tenta as que continuam sem foto.
 */
export async function POST() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ ok: false, message: 'Acesso restrito.' }, { status: 403 });
  }

  const result = await syncTcgdexArt();
  return NextResponse.json({ ok: true, ...result });
}
