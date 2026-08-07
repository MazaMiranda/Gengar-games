import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { AdminNav } from '@/components/admin/admin-nav';
import { AdminMobileNav } from '@/components/admin/admin-mobile-nav';

export const metadata: Metadata = {
  title: { default: 'Painel', template: '%s · Painel Gengar' },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) redirect('/login?callbackUrl=/admin');
  if (session.user.role !== 'admin') redirect('/conta');

  return (
    <div className="flex min-h-dvh bg-void">
      <a href="#painel" className="skip-link">
        Pular para o conteúdo
      </a>
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 border-r border-line bg-surface/40 lg:block">
        <AdminNav />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-line bg-void/85 px-5 py-4 backdrop-blur-2xl lg:px-10">
          <AdminMobileNav />
          <div className="flex items-center gap-3">
            <div className="hidden flex-col items-end sm:flex">
              <span className="text-xs font-semibold text-ink">{session.user.name}</span>
              <span className="font-tech text-2xs uppercase tracking-wider text-ink-faint">
                Administrador
              </span>
            </div>
            <span className="grid size-9 place-items-center rounded-full border border-line bg-linear-to-br from-brand-500/40 to-brand-800/40 font-display text-xs font-bold text-ink">
              {(session.user.name ?? 'A').charAt(0).toUpperCase()}
            </span>
          </div>
        </header>

        <main
          id="painel"
          tabIndex={-1}
          className="min-w-0 flex-1 px-5 py-8 focus-visible:outline-none lg:px-10 lg:py-10"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
