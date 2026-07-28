import Link from 'next/link';
import {
  Anchor,
  ArrowUpRight,
  Cpu,
  Crown,
  Disc3,
  Eye,
  Gamepad2,
  Headphones,
  Plug,
  Recycle,
  Shield,
  Shirt,
  Sparkles,
  Star,
  Sword,
  Trophy,
  Wand2,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type { Brand, Category } from '@/core/domain/entities';
import { platformList, tcgGameList } from '@/core/domain/taxonomy';
import { Reveal } from '@/components/ui/motion';
import { Marquee } from '@/components/ui/motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const GLYPHS: Record<string, LucideIcon> = {
  zap: Zap,
  anchor: Anchor,
  sparkles: Sparkles,
  eye: Eye,
  wand: Wand2,
  sword: Sword,
  cpu: Cpu,
  gamepad: Gamepad2,
  disc: Disc3,
  recycle: Recycle,
  headphones: Headphones,
  plug: Plug,
  shield: Shield,
  trophy: Trophy,
  crown: Crown,
  star: Star,
  shirt: Shirt,
};

/** Bento de categorias — o primeiro bloco tem peso visual maior. */
export function CategoryBento({ categories }: { categories: Category[] }) {
  const featured = categories.filter((category) =>
    ['pokemon-tcg', 'consoles', 'one-piece-tcg', 'jogos', 'colecionaveis', 'headsets', 'magic', 'controles'].includes(
      category.slug,
    ),
  );

  const spans = [
    'md:col-span-3 md:row-span-2',
    'md:col-span-3',
    'md:col-span-3',
    'md:col-span-2',
    'md:col-span-2',
    'md:col-span-2',
    'md:col-span-3',
    'md:col-span-3',
  ];

  return (
    <div className="grid auto-rows-[11rem] grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-6">
      {featured.map((category, index) => {
        const Glyph = GLYPHS[category.glyph] ?? Sparkles;
        const large = index === 0;

        return (
          <Reveal key={category.slug} delay={index * 0.05} className={cn(spans[index], 'min-h-[11rem]')}>
            <Link
              href={`/catalogo?categoria=${category.slug}`}
              className="plate grain group relative flex h-full flex-col justify-between overflow-hidden rounded-xl p-6 transition-all duration-500 ease-out-expo hover:-translate-y-1 hover:border-line-brand hover:shadow-lift"
            >
              <div
                className="absolute -right-16 -top-16 size-48 rounded-full opacity-45 blur-3xl transition-all duration-700 ease-out-expo group-hover:opacity-80"
                style={{
                  background: `radial-gradient(circle, hsl(${category.accent} 85% 55% / 0.55), transparent 70%)`,
                }}
                aria-hidden
              />

              <div className="relative flex items-start justify-between gap-4">
                <span
                  className="grid size-11 place-items-center rounded-md border border-line bg-white/4 transition-all duration-500 group-hover:scale-110"
                  style={{ color: `hsl(${category.accent} 90% 72%)` }}
                >
                  <Glyph className="size-5" strokeWidth={1.6} />
                </span>
                <ArrowUpRight className="size-4 text-ink-ghost transition-all duration-400 ease-out-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-300" />
              </div>

              <div className="relative flex flex-col gap-1.5">
                <h3
                  className={cn(
                    'font-display font-bold leading-tight text-ink transition-colors group-hover:text-brand-100',
                    large ? 'text-2xl' : 'text-base',
                  )}
                >
                  {category.name}
                </h3>
                <p className={cn('text-ink-muted', large ? 'text-sm' : 'text-xs')}>{category.tagline}</p>
                {category.productCount !== undefined ? (
                  <span className="mt-1 font-tech text-2xs uppercase tracking-[0.2em] text-ink-ghost">
                    {category.productCount} produtos
                  </span>
                ) : null}
              </div>
            </Link>
          </Reveal>
        );
      })}
    </div>
  );
}

/** Painéis dos sete TCGs atendidos pela loja. */
export function TcgShowcase() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {tcgGameList.map((game, index) => (
        <Reveal key={game.slug} delay={index * 0.04}>
          <Link
            href={`/tcg/${game.slug}`}
            className="group relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-lg border border-line bg-surface/60 p-5 transition-all duration-500 ease-out-expo hover:-translate-y-1 hover:border-line-brand"
          >
            <div
              className="absolute inset-x-0 bottom-0 h-px opacity-60 transition-opacity duration-500 group-hover:opacity-100"
              style={{ background: `linear-gradient(90deg, transparent, hsl(${game.accent} 90% 62%), transparent)` }}
              aria-hidden
            />
            <div className="flex items-start justify-between gap-3">
              <span
                className="font-tech text-2xs font-bold uppercase tracking-[0.24em]"
                style={{ color: `hsl(${game.accent} 90% 70%)` }}
              >
                {game.short}
              </span>
              <ArrowUpRight className="size-3.5 text-ink-ghost transition-all duration-400 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink-muted" />
            </div>
            <div className="flex flex-col gap-1.5">
              <h3 className="font-display text-sm font-bold text-ink">{game.name}</h3>
              <p className="text-xs leading-relaxed text-ink-faint">{game.tagline}</p>
            </div>
          </Link>
        </Reveal>
      ))}

      <Reveal delay={0.3}>
        <Link
          href="/tcg"
          className="group flex h-full min-h-32 flex-col justify-between gap-6 rounded-lg border border-dashed border-line-strong p-5 transition-all duration-500 hover:border-brand-400/50 hover:bg-brand-500/6"
        >
          <span className="eyebrow">Tudo</span>
          <span className="flex items-center gap-2 font-display text-sm font-bold text-ink-muted transition-colors group-hover:text-brand-100">
            Ver a área TCG completa
            <ArrowUpRight className="size-3.5" />
          </span>
        </Link>
      </Reveal>
    </div>
  );
}

/** Faixas por plataforma para a área gamer. */
export function PlatformStrip() {
  return (
    <div className="grid gap-3 md:grid-cols-5">
      {platformList.map((platform, index) => (
        <Reveal key={platform.slug} delay={index * 0.05}>
          <Link
            href={`/gamer/${platform.slug}`}
            className="plate group relative flex h-40 flex-col justify-end overflow-hidden rounded-lg p-5 transition-all duration-500 ease-out-expo hover:-translate-y-1 hover:border-line-brand"
          >
            <div
              className="absolute inset-0 opacity-25 transition-opacity duration-700 group-hover:opacity-45"
              style={{
                background: `radial-gradient(120% 90% at 20% 0%, hsl(${platform.accent} 85% 50% / 0.6), transparent 62%)`,
              }}
              aria-hidden
            />
            <Gamepad2
              className="absolute -right-4 -top-3 size-24 opacity-8 transition-all duration-700 group-hover:opacity-15 group-hover:rotate-6"
              strokeWidth={0.8}
              aria-hidden
            />
            <div className="relative flex flex-col gap-1">
              <h3 className="font-display text-base font-bold text-ink">{platform.name}</h3>
              <p className="text-2xs leading-relaxed text-ink-faint">{platform.tagline}</p>
            </div>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}

export function BrandStrip({ brands }: { brands: Brand[] }) {
  return (
    <div className="border-y border-line py-10">
      <Marquee speed={46}>
        <div className="flex items-center gap-14">
          {brands.map((brand) => (
            <span
              key={brand.slug}
              className="whitespace-nowrap font-display text-lg font-bold tracking-tight text-ink-ghost transition-colors duration-500 hover:text-ink-muted"
            >
              {brand.name}
            </span>
          ))}
        </div>
      </Marquee>
    </div>
  );
}

/** Banner promocional de largura total. */
export function PromoBanner() {
  return (
    <Reveal className="container-page">
      <div className="grain relative overflow-hidden rounded-2xl border border-line-brand">
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(115deg, #240a44 0%, #3f1178 38%, #6d28d9 72%, #9333ea 100%)',
          }}
          aria-hidden
        />
        <div className="grid-tech absolute inset-0 opacity-25" aria-hidden />
        <div
          className="absolute -bottom-24 -right-16 size-96 rounded-full blur-[90px]"
          style={{ background: 'radial-gradient(circle, rgba(192,132,252,0.65), transparent 70%)' }}
          aria-hidden
        />

        <div className="relative grid gap-10 p-8 md:grid-cols-2 md:items-center md:p-14">
          <div className="flex flex-col gap-5">
            <span className="font-tech text-2xs font-bold uppercase tracking-[0.3em] text-brand-100/90">
              Semana do TCG · até domingo
            </span>
            <h2 className="text-display font-extrabold leading-[0.95] text-white">
              15% OFF em
              <br />
              singles e selados
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-white/75">
              Use o cupom <strong className="font-tech tracking-wider text-white">TCG15</strong> em
              compras acima de R$ 500. Válido para Pokémon, One Piece, Magic, Yu-Gi-Oh!, Lorcana,
              Flesh and Blood e Digimon.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Button asChild size="lg" variant="secondary" className="border-white/25 bg-white/12 text-white hover:bg-white/20">
                <Link href="/catalogo?tipo=tcg-card&tipo=tcg-sealed">Aproveitar agora</Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="text-white/80 hover:bg-white/10 hover:text-white">
                <Link href="/tcg">Ver regras da promoção</Link>
              </Button>
            </div>
          </div>

          <div className="relative hidden justify-end md:flex">
            <div className="flex gap-4">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className="h-52 w-36 rounded-lg border border-white/20 bg-white/8 backdrop-blur-md"
                  style={{
                    transform: `rotate(${(index - 1) * 7}deg) translateY(${index === 1 ? -14 : 0}px)`,
                    boxShadow: '0 30px 60px -25px rgba(0,0,0,0.7)',
                  }}
                >
                  <div className="m-3 h-24 rounded-sm bg-linear-to-br from-white/25 to-transparent" />
                  <div className="mx-3 h-2 w-2/3 rounded-full bg-white/25" />
                  <div className="mx-3 mt-2 h-2 w-1/2 rounded-full bg-white/15" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
