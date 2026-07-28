import type { Metadata } from 'next';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { LoginForm } from '@/components/auth/login-form';
import { LineSkeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Entrar',
  description: 'Acesse sua conta Gengar Games para acompanhar pedidos, favoritos e cupons.',
};

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect('/conta');

  return (
    <Suspense fallback={<LineSkeleton rows={6} />}>
      <LoginForm />
    </Suspense>
  );
}
