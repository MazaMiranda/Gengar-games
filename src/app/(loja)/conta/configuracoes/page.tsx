import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { getRepositories } from '@/infrastructure/container';
import { AccountSettingsForm } from '@/components/account/settings-form';

export const metadata: Metadata = {
  title: 'Configurações',
  robots: { index: false, follow: false },
};

export default async function SettingsPage() {
  const session = await auth();
  const { users } = await getRepositories();
  const user = await users.findById(session!.user.id);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1.5">
        <h1 className="font-display text-xl font-bold text-ink">Configurações</h1>
        <p className="text-sm text-ink-muted">
          Dados cadastrais, preferências de comunicação e segurança da conta.
        </p>
      </header>

      <AccountSettingsForm
        defaults={{
          name: user?.name ?? '',
          email: user?.email ?? '',
          phone: user?.phone ?? '',
          document: user?.document ?? '',
        }}
      />
    </div>
  );
}
