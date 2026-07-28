'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  Settings,
  ShieldCheck,
  Ticket,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/conta', label: 'Visão geral', icon: LayoutDashboard, exact: true },
  { href: '/conta/pedidos', label: 'Meus pedidos', icon: Package },
  { href: '/conta/favoritos', label: 'Favoritos', icon: Heart },
  { href: '/conta/enderecos', label: 'Endereços', icon: MapPin },
  { href: '/conta/cupons', label: 'Cupons', icon: Ticket },
  { href: '/conta/configuracoes', label: 'Configurações', icon: Settings },
];

interface AccountNavProps {
  user: { name: string; email: string; role: 'customer' | 'admin'; loyaltyPoints: number };
}

export function AccountNav({ user }: AccountNavProps) {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col gap-5">
      <div className="plate flex items-center gap-4 rounded-xl p-5">
        <span className="grid size-12 shrink-0 place-items-center rounded-full border border-line bg-linear-to-br from-brand-500/40 to-brand-800/40 font-display text-base font-bold text-ink">
          {user.name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
          <p className="truncate text-2xs text-ink-faint">{user.email}</p>
        </div>
      </div>

      <div className="plate flex items-center justify-between rounded-lg px-5 py-4">
        <span className="font-tech text-2xs uppercase tracking-[0.18em] text-ink-faint">Pontos</span>
        <span className="font-display text-lg font-bold text-brand-200">
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
              className={cn(
                'group flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-all duration-300',
                active
                  ? 'border border-brand-400/35 bg-brand-500/12 text-ink shadow-glow-sm'
                  : 'border border-transparent text-ink-muted hover:bg-white/4 hover:text-ink',
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
            className="mt-2 flex items-center gap-3 rounded-md border border-line px-4 py-3 text-sm font-medium text-ink-muted transition-all hover:border-brand-400/40 hover:text-brand-200"
          >
            <ShieldCheck className="size-4 text-brand-300" />
            Painel administrativo
          </Link>
        ) : null}

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/' })}
          className="mt-2 flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium text-ink-faint transition-colors hover:bg-danger/8 hover:text-danger"
        >
          <LogOut className="size-4" />
          Sair da conta
        </button>
      </nav>
    </aside>
  );
}
