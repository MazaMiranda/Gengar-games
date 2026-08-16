'use client';

import {
  GearSix,
  Heart,
  MapPin,
  Package,
  ShieldCheck,
  SignOut,
  SquaresFour,
  Ticket,
} from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/conta', label: 'Visão geral', icon: SquaresFour, exact: true },
  { href: '/conta/pedidos', label: 'Meus pedidos', icon: Package },
  { href: '/conta/favoritos', label: 'Favoritos', icon: Heart },
  { href: '/conta/enderecos', label: 'Endereços', icon: MapPin },
  { href: '/conta/cupons', label: 'Cupons', icon: Ticket },
  { href: '/conta/configuracoes', label: 'Configurações', icon: GearSix },
];

interface AccountNavProps {
  user: { name: string; email: string; role: 'customer' | 'admin'; loyaltyPoints: number };
}

export function AccountNav({ user }: AccountNavProps) {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col gap-5">
      <div className="plate flex items-center gap-4 rounded-xl p-5">
        <span className="border-line from-brand-500/40 to-brand-800/40 font-display text-ink grid size-12 shrink-0 place-items-center rounded-full border bg-linear-to-br text-base font-bold">
          {user.name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="text-ink truncate text-sm font-semibold">{user.name}</p>
          <p className="text-2xs text-ink-faint truncate">{user.email}</p>
        </div>
      </div>

      <div className="plate flex items-center justify-between rounded-lg px-5 py-4">
        <span className="font-tech text-2xs text-ink-faint tracking-[0.18em] uppercase">
          Pontos
        </span>
        <span className="font-display text-brand-200 text-lg font-bold">
          {user.loyaltyPoints.toLocaleString('pt-BR')}
        </span>
      </div>

      <nav className="flex flex-col gap-1" aria-label="Menu da conta">
        {LINKS.map((link) => {
          const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              // O destaque era só visual: quem navega por leitor de tela ouvia
              // seis links idênticos, sem saber em qual página já está.
              aria-current={active ? 'page' : undefined}
              className={cn(
                'group flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-all duration-300',
                active
                  ? 'border-brand-400/35 bg-brand-500/12 text-ink shadow-glow-sm border'
                  : 'text-ink-muted hover:bg-ink/4 hover:text-ink border border-transparent',
              )}
            >
              <link.icon className={cn('size-4', active ? 'text-brand-300' : 'text-ink-faint')} />
              {link.label}
            </Link>
          );
        })}

        {user.role === 'admin' ? (
          <Link
            href="/admin"
            className="border-line text-ink-muted hover:border-brand-400/40 hover:text-brand-200 mt-2 flex items-center gap-3 rounded-md border px-4 py-3 text-sm font-medium transition-all"
          >
            <ShieldCheck className="text-brand-300 size-4" />
            Painel administrativo
          </Link>
        ) : null}

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/' })}
          className="text-ink-faint hover:bg-danger/8 hover:text-danger mt-2 flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-colors"
        >
          <SignOut className="size-4" />
          Sair da conta
        </button>
      </nav>
    </aside>
  );
}
