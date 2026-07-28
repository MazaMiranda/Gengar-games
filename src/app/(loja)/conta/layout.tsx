import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getRepositories } from '@/infrastructure/container';
import { PageHeader } from '@/components/layout/page-header';
import { AccountNav } from '@/components/account/account-nav';

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login?callbackUrl=/conta');

  const { users } = await getRepositories();
  const user = await users.findById(session.user.id);

  return (
    <>
      <PageHeader
        compact
        eyebrow="Minha conta"
        title={`Olá, ${(user?.name ?? session.user.name ?? 'colecionador').split(' ')[0]}`}
        description="Acompanhe pedidos, gerencie endereços e mantenha seus favoritos organizados."
        crumbs={[{ label: 'Início', href: '/' }, { label: 'Minha conta' }]}
      />

      <div className="container-page grid gap-10 py-12 lg:grid-cols-[16rem_1fr] lg:gap-12">
        <AccountNav
          user={{
            name: user?.name ?? session.user.name ?? '',
            email: user?.email ?? session.user.email ?? '',
            role: session.user.role,
            loyaltyPoints: user?.loyaltyPoints ?? 0,
          }}
        />
        <div className="min-w-0">{children}</div>
      </div>
    </>
  );
}
