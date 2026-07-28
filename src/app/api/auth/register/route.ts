import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { getRepositories } from '@/infrastructure/container';

export const runtime = 'nodejs';

const schema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: 'Dados inválidos.' }, { status: 400 });
  }

  const { users } = await getRepositories();
  const existing = await users.findByEmail(parsed.data.email);

  if (existing) {
    return NextResponse.json(
      { ok: false, message: 'Já existe uma conta com este e-mail. Tente entrar.' },
      { status: 409 },
    );
  }

  const user = await users.create({
    name: parsed.data.name,
    email: parsed.data.email.toLowerCase(),
    passwordHash: await bcrypt.hash(parsed.data.password, 10),
    role: 'customer',
    addresses: [],
    wishlist: [],
    coupons: ['PRIMEIRACOMPRA'],
    loyaltyPoints: 0,
  });

  return NextResponse.json({ ok: true, user: { id: user.id, name: user.name, email: user.email } });
}
