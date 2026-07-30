'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  BarChart3,
  Boxes,
  Gamepad2,
  LayoutDashboard,
  LogOut,
  Package,
  Percent,
  ShoppingCart,
  Sparkles,
  Store,
  Tags,
  Ticket,
  Users,
} from 'lucide-react';
import { Logo } from '@/components/layout/logo';
import { cn } from '@/lib/utils';

const SECTIONS: { title: string; links: { href: string; label: string; icon: React.ElementType }[] }[] = [
  {
    title: 'Operação',
    links: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/pedidos', label: 'Pedidos', icon: ShoppingCart },
      { href: '/admin/estoque', label: 'Estoque', icon: Boxes },
    ],
  },
  {
    title: 'Catálogo',
    links: [
      { href: '/admin/produtos', label: 'Produtos', icon: Package },
      { href: '/admin/categorias', label: 'Categorias', icon: Tags },
      { href: '/admin/tcgs', label: 'TCGs', icon: Sparkles },
      { href: '/admin/consoles', label: 'Consoles', icon: Gamepad2 },
    ],
  },
  {
    title: 'Crescimento',
    links: [
      { href: '/admin/cupons', label: 'Cupons', icon: Ticket },
      { href: '/admin/promocoes', label: 'Promoções', icon: Percent },
      { href: '/admin/usuarios', label: 'Usuários', icon: Users },
      { href: '/admin/relatorios', label: 'Relatórios', icon: BarChart3 },
    ],
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex h-full flex-col gap-8 p-6" aria-label="Navegação do painel">
      <Logo href="/admin" />

      <div className="flex flex-1 flex-col gap-7 overflow-y-auto">
        {SECTIONS.map((section) => (
          <div key={section.title} className="flex flex-col gap-2">
            <span className="eyebrow px-3">{section.title}</span>
            <ul className="flex flex-col gap-0.5">
              {section.links.map((link) => {
                const active = link.href === '/admin' ? pathname === '/admin' : pathname.startsWith(link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-300',
                        active
                          ? 'bg-brand-500/14 text-ink shadow-[inset_2px_0_0_0_var(--color-brand-400)]'
                          : 'text-ink-muted hover:bg-ink/4 hover:text-ink',
                      )}
                    >
                      <link.icon className={cn('size-4', active ? 'text-brand-300' : 'text-ink-faint')} />
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-1 border-t border-line pt-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-ink/4 hover:text-ink"
        >
          <Store className="size-4 text-ink-faint" />
          Ver a loja
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-ink-faint transition-colors hover:bg-danger/8 hover:text-danger"
        >
          <LogOut className="size-4" />
          Sair
        </button>
      </div>
    </nav>
  );
}
