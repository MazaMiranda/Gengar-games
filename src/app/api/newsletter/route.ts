import { NextResponse } from 'next/server';
import { z } from 'zod';

export const runtime = 'nodejs';

const schema = z.object({ email: z.string().email() });

/**
 * Inscrição na newsletter. O provedor de e-mail marketing entra aqui — o
 * contrato com o cliente já é o definitivo.
 */
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: 'E-mail inválido.' }, { status: 400 });
  }

  return NextResponse.json({ ok: true, email: parsed.data.email });
}
