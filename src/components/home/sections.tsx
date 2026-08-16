import {
  Anchor,
  ArrowUpRight,
  Cpu,
  Crown,
  Disc,
  Eye,
  GameController,
  Headphones,
  Lightning,
  MagicWand,
  Plug,
  Recycle,
  Shield,
  Sparkle,
  Star,
  Sword,
  TShirt,
  Trophy,
} from '@phosphor-icons/react/dist/ssr';
import type { Icon } from '@phosphor-icons/react/lib';
import Link from 'next/link';
import type { Brand, Category } from '@/core/domain/entities';
import { platformList } from '@/core/domain/taxonomy';
import { Reveal } from '@/components/ui/motion';
import { Marquee } from '@/components/ui/motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const GLYPHS: Record<string, Icon> = {
  zap: Lightning,
  anchor: Anchor,
  sparkles: Sparkle,
  eye: Eye,
  wand: MagicWand,
  sword: Sword,
  cpu: Cpu,
  gamepad: GameController,
  disc: Disc,
  recycle: Recycle,
  headphones: Headphones,
  plug: Plug,
  shield: Shield,
  trophy: Trophy,
  crown: Crown,
  star: Star,
  shirt: TShirt,
};

/** Bento de categorias — o primeiro bloco tem peso visual maior. */
export function CategoryBento({ categories }: { categories: Category[] }) {
  const featured = categories.filter((category) =>
    [
      'pokemon-tcg',
      'consoles',
      'jogos',
      'controles',
      'headsets',
      'protecao-tcg',
      'colecionaveis',
      'edicoes-colecionador',
    ].includes(category.slug),
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
        const Glyph = GLYPHS[category.glyph] ?? Sparkle;
        const large = index === 0;

        return (
          <Reveal
            key={category.slug}
            delay={index * 0.05}
            className={cn(spans[index], 'min-h-[11rem]')}
          >
            <Link
              href={`/catalogo?categoria=${category.slug}`}
              className="plate grain group ease-out-expo hover:border-line-brand hover:shadow-lift relative flex h-full flex-col justify-between overflow-hidden rounded-xl p-6 transition-all duration-500 hover:-translate-y-1"
            >
              <div
                className="ease-out-expo absolute -top-16 -right-16 size-48 rounded-full opacity-45 blur-3xl transition-all duration-700 group-hover:opacity-80"
                /* Um acento na página inteira. Cada categoria tinha o próprio
                   matiz (category.accent), então a home acendia oito cores
                   diferentes na mesma grade e nenhuma delas era a da marca. */
                style={{
                  background:
                    'radial-gradient(circle, color-mix(in srgb, var(--color-brand-500) 28%, transparent), transparent 70%)',
                }}
                aria-hidden
              />

              <div className="relative flex items-start justify-between gap-4">
                <span
                  className="border-line bg-ink/4 text-brand-300 grid size-11 place-items-center rounded-md border transition-all duration-500 group-hover:scale-110"
                >
                  <Glyph className="size-5" weight="light" />
                </span>
                <ArrowUpRight className="text-ink-ghost ease-out-expo group-hover:text-brand-300 size-4 transition-all duration-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>

              <div className="relative flex flex-col gap-1.5">
                <h3
                  className={cn(
                    'font-display text-ink group-hover:text-brand-100 leading-tight font-bold transition-colors',
                    large ? 'text-2xl' : 'text-base',
                  )}
                >
                  {category.name}
                </h3>
                <p className={cn('text-ink-muted', large ? 'text-sm' : 'text-xs')}>
                  {category.tagline}
                </p>
                {category.productCount !== undefined ? (
                  <span className="font-tech text-ink-ghost mt-1 text-xs">
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

/** Faixas por plataforma para a área gamer. */
export function PlatformStrip() {
  return (
    <div className="grid gap-3 md:grid-cols-5">
      {platformList.map((platform, index) => (
        <Reveal key={platform.slug} delay={index * 0.05}>
          <Link
            href={`/gamer/${platform.slug}`}
            className="plate group ease-out-expo hover:border-line-brand relative flex h-40 flex-col justify-end overflow-hidden rounded-lg p-5 transition-all duration-500 hover:-translate-y-1"
          >
            <div
              className="absolute inset-0 opacity-25 transition-opacity duration-700 group-hover:opacity-45"
              /* Mesmo motivo do bento: platform.accent dava cinco matizes numa
                 faixa de cinco itens. Aqui é o acento único da marca. */
              style={{
                background:
                  'radial-gradient(120% 90% at 20% 0%, color-mix(in srgb, var(--color-brand-500) 30%, transparent), transparent 62%)',
              }}
              aria-hidden
            />
            <GameController
              className="absolute -top-3 -right-4 size-24 opacity-8 transition-all duration-700 group-hover:rotate-6 group-hover:opacity-15"
              weight="light"
              aria-hidden
            />
            <div className="relative flex flex-col gap-1">
              <h3 className="font-display text-ink text-base font-bold">{platform.name}</h3>
              <p className="text-2xs text-ink-faint leading-relaxed">{platform.tagline}</p>
            </div>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}

export function BrandStrip({ brands }: { brands: Brand[] }) {
  return (
    <div className="border-line border-y py-10">
      <Marquee speed={46}>
        <div className="flex items-center gap-14">
          {brands.map((brand) => (
            <span
              key={brand.slug}
              className="font-display text-ink-ghost hover:text-ink-muted text-lg font-bold tracking-tight whitespace-nowrap transition-colors duration-500"
            >
              {brand.name}
            </span>
          ))}
        </div>
      </Marquee>
    </div>
  );
}

/**
 * Faixa de promoção.
 *
 * Reescrita por dois motivos, não por gosto:
 *
 * 1. Era uma chapa violeta escura cravada em hex no meio de uma página clara.
 *    Uma seção que inverte o tema no meio do rolo lê como erro de montagem,
 *    não como ênfase. Agora é a mesma superfície das outras seções, e o
 *    destaque vem de borda de acento e do botão, não de trocar o fundo.
 *
 * 2. A coluna da direita era uma pilha de três cards vazios feitos de <div>:
 *    retângulo cinza com duas barrinhas dentro, imitando carta. Placeholder
 *    de layout entregue como conteúdo. Saiu inteiro — a promoção se sustenta
 *    no valor e no cupom, e o catálogo logo abaixo já mostra produto real.
 */
export function PromoBanner() {
  return (
    <Reveal className="container-page">
      <div className="plate border-line-brand relative overflow-hidden rounded-2xl border">
        <div
          className="absolute inset-y-0 left-0 w-1/2"
          style={{
            background:
              'radial-gradient(80% 120% at 0% 50%, color-mix(in srgb, var(--color-brand-500) 14%, transparent), transparent 70%)',
          }}
          aria-hidden
        />

        <div className="relative flex flex-col gap-6 p-8 md:flex-row md:items-center md:justify-between md:p-14">
          <div className="flex max-w-xl flex-col gap-4">
            <span className="cert-label self-start">Semana do TCG, até domingo</span>
            <h2 className="text-display text-ink font-semibold">15% off em singles e selados</h2>
            <p className="text-ink-muted max-w-md text-sm leading-relaxed">
              Cupom <strong className="font-tech text-ink font-semibold">TCG15</strong> em compras
              acima de R$ 500, para singles e selados de Pokémon TCG.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/catalogo?tipo=tcg-card&tipo=tcg-sealed">Aproveitar agora</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/tcg">Ver regras</Link>
            </Button>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
