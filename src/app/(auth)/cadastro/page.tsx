import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { RegisterForm } from '@/components/auth/register-form';

export const metadata: Metadata = {
  title: 'Criar conta',
  description: 'Crie sua conta na Gengar Games e ganhe cupom de primeira compra.',
};

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect('/conta');

  return <RegisterForm />;
}
