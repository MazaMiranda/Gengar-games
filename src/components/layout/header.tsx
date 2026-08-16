'use client';

import { Heart, List, MagnifyingGlass, ShoppingBag, User } from '@phosphor-icons/react/dist/ssr';
import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { primaryNav } from '@/lib/navigation';
import { useCartStore } from '@/stores/cart-store';
import { useWishlistStore } from '@/stores/wishlist-store';
import { cn } from '@/lib/utils';
import { Logo } from './logo';
import { SearchDialog } from './search-dialog';
import { MobileNav } from './mobile-nav';
import { ThemeToggle } from './theme-toggle';

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

  /**
   * Histerese: colapsa aos 72px, só reabre abaixo de 12px.
   *
   * A folga entre os dois limiares precisa ser maior que a altura do ticker
   * (36px). Com um limiar único, colapsar encolhia o documento, o ancoramento
   * de rolagem do navegador compensava o scrollY para baixo, isso cruzava o
   * limiar de volta e reabria o ticker — um ciclo que se repetia sozinho, com
   * a página parada.
   */
  useMotionValueEvent(scrollY, 'change', (value) => {
    setScrolled((current) => (current ? value > 12 : value > 72));
  });

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

  /**
   * Página atual e menu aberto são leituras diferentes.
   *
   * Antes as duas dividiam o mesmo `isActive`: o sublinhado acendia no hover e
   * apagava assim que o ponteiro saía, então em nenhum momento a barra dizia
   * onde o visitante está — só onde o mouse estava.
   *
   * Entram na conta apenas as entradas cujo href não tem query. As outras
   * (Acessórios, Colecionáveis, Ofertas) são filtros do catálogo, não seções:
   * casar só pelo pathname acenderia as três de uma vez em qualquer /catalogo.
   */
  const isCurrentRoute = (href: string) =>
    !href.includes('?') && (pathname === href || pathname.startsWith(`${href}/`));

  const isAdmin = session?.user?.role === 'admin';
  const destinoDaConta = !session?.user ? '/login' : isAdmin ? '/admin' : '/conta';
  const rotuloDaConta = !session?.user ? 'Entrar' : isAdmin ? 'Painel' : 'Minha conta';

  return (
    <header className="sticky top-0 z-40">
      {/* Barra principal */}
      <div
        onMouseLeave={scheduleClose}
        className={cn(
          'ease-out-expo border-b transition-all duration-500',
          scrolled || activeMenu
            ? 'border-line bg-void/85 shadow-[0_10px_40px_-24px_rgba(0,0,0,0.9)] backdrop-blur-2xl'
            : 'bg-void/40 border-transparent backdrop-blur-lg',
        )}
      >
        <div className="container-page flex h-16 items-center justify-between gap-3 md:h-18 md:gap-6">
          <div className="flex min-w-0 items-center gap-3 lg:gap-8">
            <MobileNav>
              <button
                type="button"
                aria-label="Abrir menu"
                className="tap-44 border-line text-ink-muted hover:border-line-strong hover:text-ink grid size-10 place-items-center rounded-md border transition-colors lg:hidden"
              >
                <List className="size-4" />
              </button>
            </MobileNav>

            <Logo />

            <nav className="hidden items-center gap-1 lg:flex" aria-label="Navegação principal">
              {primaryNav.map((entry) => {
                const isOpen = activeMenu === entry.id;
                const isCurrent = isCurrentRoute(entry.href);
                return (
                  <div key={entry.id} onMouseEnter={() => openMenu(entry.id)}>
                    <Link
                      href={entry.href}
                      onFocus={() => openMenu(entry.id)}
                      aria-expanded={entry.columns ? isOpen : undefined}
                      aria-current={isCurrent ? 'page' : undefined}
                      className={cn(
                        'relative flex h-10 items-center rounded-md px-3.5 text-sm font-semibold transition-colors duration-300',
                        isOpen || isCurrent ? 'text-ink' : 'text-ink-muted hover:text-ink',
                      )}
                    >
                      {entry.label}
                      {/* Duas marcas distintas de propósito: a seção atual fica
                          com o traço cheio e permanente, o hover continua sendo
                          o degradê que some. Se as duas fossem iguais, abrir o
                          menu de outra seção apagaria a única pista de onde o
                          visitante está. */}
                      <span
                        className={cn(
                          'ease-out-expo absolute inset-x-3 -bottom-px h-px origin-left transition-transform duration-400',
                          isCurrent
                            ? 'bg-brand-400 scale-x-100'
                            : cn(
                                'from-brand-400 bg-linear-to-r to-transparent',
                                isOpen ? 'scale-x-100' : 'scale-x-0',
                              ),
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
                className="group border-line bg-ink/3 text-ink-faint hover:border-brand-400/40 hover:bg-brand-500/8 hidden h-10 items-center gap-3 rounded-md border pr-2 pl-3.5 text-sm transition-all duration-300 md:flex md:w-56 lg:w-64"
              >
                <MagnifyingGlass className="size-4" />
                <span className="flex-1 text-left text-xs">Buscar produtos…</span>
                {/* Fundo próprio: encostado no botão translúcido o contraste
                    da tecla dependia do que passasse atrás. Sobre --surface é
                    determinístico nos dois temas. */}
                <kbd className="border-line bg-surface font-tech text-ink-faint rounded-xs border px-1.5 py-0.5 text-[0.625rem]">
                  ⌘K
                </kbd>
              </button>
            </SearchDialog>

            <SearchDialog>
              <button
                type="button"
                aria-label="Buscar"
                className="tap-44 text-ink-muted hover:bg-ink/6 hover:text-ink grid size-10 place-items-center rounded-md transition-colors md:hidden"
              >
                <MagnifyingGlass className="size-4" />
              </button>
            </SearchDialog>

            <ThemeToggle />

            <Link
              href="/conta/favoritos"
              aria-label="Favoritos"
              className="tap-44 text-ink-muted hover:bg-ink/6 hover:text-ink relative hidden size-10 place-items-center rounded-md transition-colors sm:grid"
            >
              <Heart className="size-4" />
              {wishlistCount > 0 ? (
                <span className="bg-brand-400 shadow-glow-sm absolute top-1.5 right-1.5 size-1.5 rounded-full" />
              ) : null}
            </Link>

            {/* Administrador vai para o painel: mandá-lo para /conta seria
                devolvê-lo à área de cliente logo depois de o login ter
                justamente evitado isso. */}
            <Link
              href={destinoDaConta}
              aria-label={rotuloDaConta}
              className="tap-44 text-ink-muted hover:bg-ink/6 hover:text-ink grid size-10 place-items-center rounded-md transition-colors"
            >
              <User className="size-4" />
            </Link>

            <button
              type="button"
              onClick={openCart}
              aria-label={`Abrir carrinho, ${itemCount} itens`}
              className="tap-44 border-line bg-ink/4 text-ink hover:border-brand-400/50 hover:bg-brand-500/12 hover:shadow-glow-sm relative ml-1 grid size-10 place-items-center rounded-md border transition-all duration-300"
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
                    className="from-brand-400 to-brand-600 font-tech shadow-glow-sm absolute -top-1.5 -right-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-linear-to-b px-1 text-[0.625rem] font-bold text-white"
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
              className="border-line bg-void/95 absolute inset-x-0 top-full hidden border-b backdrop-blur-2xl lg:block"
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
                            className="group hover:bg-ink/5 flex flex-col gap-0.5 rounded-md px-3 py-2 transition-colors"
                          >
                            <span className="text-ink-muted group-hover:text-ink text-sm font-semibold transition-colors">
                              {link.label}
                            </span>
                            {link.hint ? (
                              <span className="text-2xs text-ink-ghost line-clamp-1">
                                {link.hint}
                              </span>
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
                        className="absolute -top-10 -right-10 size-40 rounded-full blur-3xl"
                        style={{
                          background:
                            'radial-gradient(circle, color-mix(in srgb, var(--color-brand-500) 26%, transparent), transparent 70%)',
                        }}
                      />
                      <div className="relative flex flex-col gap-2">
                        <h4 className="font-display text-ink text-base leading-snug font-bold">
                          {active.highlight.title}
                        </h4>
                        <p className="text-ink-muted text-xs leading-relaxed">
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
