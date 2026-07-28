'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { Heart, Menu, Search, ShoppingBag, Sparkles, User } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Marquee } from '@/components/ui/motion';
import { Button } from '@/components/ui/button';
import { announcements, primaryNav } from '@/lib/navigation';
import { useCartStore } from '@/stores/cart-store';
import { useWishlistStore } from '@/stores/wishlist-store';
import { cn } from '@/lib/utils';
import { Logo } from './logo';
import { SearchDialog } from './search-dialog';
import { MobileNav } from './mobile-nav';

export function Header() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = React.useState(false);
  const [activeMenu, setActiveMenu] = React.useState<string | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const lines = useCartStore((state) => state.lines);
  const openCart = useCartStore((state) => state.open);
  const wishlist = useWishlistStore((state) => state.slugs);
  const { data: session } = useSession();

  React.useEffect(() => setMounted(true), []);
  React.useEffect(() => setActiveMenu(null), [pathname]);

  useMotionValueEvent(scrollY, 'change', (value) => setScrolled(value > 24));

  const itemCount = mounted ? lines.reduce((sum, line) => sum + line.quantity, 0) : 0;
  const wishlistCount = mounted ? wishlist.length : 0;

  const openMenu = (id: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveMenu(id);
  };

  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setActiveMenu(null), 140);
  };

  const active = primaryNav.find((entry) => entry.id === activeMenu);

  return (
    <header className="sticky top-0 z-40">
      {/* Ticker de avisos */}
      <div
        className={cn(
          'overflow-hidden border-b border-line bg-void/80 backdrop-blur-xl transition-all duration-500 ease-out-expo',
          scrolled ? 'h-0 opacity-0' : 'h-9 opacity-100',
        )}
      >
        <Marquee speed={38} className="h-9 items-center">
          <div className="flex items-center gap-12">
            {announcements.map((text) => (
              <span
                key={text}
                className="flex items-center gap-2.5 whitespace-nowrap font-tech text-2xs uppercase tracking-[0.22em] text-ink-muted"
              >
                <Sparkles className="size-3 text-brand-400" />
                {text}
              </span>
            ))}
          </div>
        </Marquee>
      </div>

      {/* Barra principal */}
      <div
        onMouseLeave={scheduleClose}
        className={cn(
          'border-b transition-all duration-500 ease-out-expo',
          scrolled || activeMenu
            ? 'border-line bg-void/85 backdrop-blur-2xl shadow-[0_10px_40px_-24px_rgba(0,0,0,0.9)]'
            : 'border-transparent bg-void/40 backdrop-blur-lg',
        )}
      >
        <div className="container-page flex h-16 items-center justify-between gap-3 md:h-18 md:gap-6">
          <div className="flex min-w-0 items-center gap-3 lg:gap-8">
            <MobileNav>
              <button
                type="button"
                aria-label="Abrir menu"
                className="grid size-10 place-items-center rounded-md border border-line text-ink-muted transition-colors hover:border-line-strong hover:text-ink lg:hidden"
              >
                <Menu className="size-4" />
              </button>
            </MobileNav>

            <Logo markOnlyOnMobile />

            <nav className="hidden items-center gap-1 lg:flex" aria-label="Navegação principal">
              {primaryNav.map((entry) => {
                const isActive = activeMenu === entry.id;
                return (
                  <div key={entry.id} onMouseEnter={() => openMenu(entry.id)}>
                    <Link
                      href={entry.href}
                      onFocus={() => openMenu(entry.id)}
                      aria-expanded={entry.columns ? isActive : undefined}
                      className={cn(
                        'relative flex h-10 items-center rounded-md px-3.5 text-sm font-semibold transition-colors duration-300',
                        isActive ? 'text-ink' : 'text-ink-muted hover:text-ink',
                      )}
                    >
                      {entry.label}
                      <span
                        className={cn(
                          'absolute inset-x-3 -bottom-px h-px origin-left bg-linear-to-r from-brand-400 to-transparent transition-transform duration-400 ease-out-expo',
                          isActive ? 'scale-x-100' : 'scale-x-0',
                        )}
                      />
                    </Link>
                  </div>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-1.5">
            <SearchDialog>
              <button
                type="button"
                className="group hidden h-10 items-center gap-3 rounded-md border border-line bg-white/3 pl-3.5 pr-2 text-sm text-ink-faint transition-all duration-300 hover:border-brand-400/40 hover:bg-brand-500/8 md:flex md:w-56 lg:w-64"
              >
                <Search className="size-4" />
                <span className="flex-1 text-left text-xs">Buscar produtos…</span>
                <kbd className="rounded-xs border border-line px-1.5 py-0.5 font-tech text-[0.625rem] text-ink-ghost">
                  ⌘K
                </kbd>
              </button>
            </SearchDialog>

            <SearchDialog>
              <button
                type="button"
                aria-label="Buscar"
                className="grid size-10 place-items-center rounded-md text-ink-muted transition-colors hover:bg-white/6 hover:text-ink md:hidden"
              >
                <Search className="size-4" />
              </button>
            </SearchDialog>

            <Link
              href="/conta/favoritos"
              aria-label="Favoritos"
              className="relative hidden size-10 place-items-center rounded-md text-ink-muted transition-colors hover:bg-white/6 hover:text-ink sm:grid"
            >
              <Heart className="size-4" />
              {wishlistCount > 0 ? (
                <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-brand-400 shadow-glow-sm" />
              ) : null}
            </Link>

            <Link
              href={session?.user ? '/conta' : '/login'}
              aria-label={session?.user ? 'Minha conta' : 'Entrar'}
              className="grid size-10 place-items-center rounded-md text-ink-muted transition-colors hover:bg-white/6 hover:text-ink"
            >
              <User className="size-4" />
            </Link>

            <button
              type="button"
              onClick={openCart}
              aria-label={`Abrir carrinho, ${itemCount} itens`}
              className="relative ml-1 grid size-10 place-items-center rounded-md border border-line bg-white/4 text-ink transition-all duration-300 hover:border-brand-400/50 hover:bg-brand-500/12 hover:shadow-glow-sm"
            >
              <ShoppingBag className="size-4" />
              <AnimatePresence>
                {itemCount > 0 ? (
                  <motion.span
                    key={itemCount}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 520, damping: 24 }}
                    className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-linear-to-b from-brand-400 to-brand-600 px-1 font-tech text-[0.625rem] font-bold text-white shadow-glow-sm"
                  >
                    {itemCount}
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Mega menu */}
        <AnimatePresence>
          {active?.columns ? (
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              onMouseEnter={() => openMenu(active.id)}
              className="absolute inset-x-0 top-full hidden border-b border-line bg-void/95 backdrop-blur-2xl lg:block"
            >
              <div className="container-page grid grid-cols-12 gap-10 py-10">
                {active.columns.map((column) => (
                  <div key={column.title} className="col-span-3 flex flex-col gap-4">
                    <h3 className="eyebrow">{column.title}</h3>
                    <ul className="flex flex-col gap-1">
                      {column.links.map((link) => (
                        <li key={link.href + link.label}>
                          <Link
                            href={link.href}
                            className="group flex flex-col gap-0.5 rounded-md px-3 py-2 transition-colors hover:bg-white/5"
                          >
                            <span className="text-sm font-semibold text-ink-muted transition-colors group-hover:text-ink">
                              {link.label}
                            </span>
                            {link.hint ? (
                              <span className="line-clamp-1 text-2xs text-ink-ghost">{link.hint}</span>
                            ) : null}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                {active.highlight ? (
                  <div className="col-span-3 col-start-10">
                    <div className="plate grain relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl p-6">
                      <div
                        className="absolute -right-10 -top-10 size-40 rounded-full blur-3xl"
                        style={{ background: 'radial-gradient(circle, rgba(147,51,234,0.5), transparent 70%)' }}
                      />
                      <div className="relative flex flex-col gap-2">
                        <h4 className="font-display text-base font-bold leading-snug text-ink">
                          {active.highlight.title}
                        </h4>
                        <p className="text-xs leading-relaxed text-ink-muted">
                          {active.highlight.description}
                        </p>
                      </div>
                      <Button asChild variant="secondary" size="sm" className="relative w-fit">
                        <Link href={active.highlight.href}>{active.highlight.cta}</Link>
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </header>
  );
}
