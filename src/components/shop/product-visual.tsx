import Image from 'next/image';
import {
  Crown,
  Disc3,
  Gamepad2,
  Headphones,
  Plug,
  Recycle,
  Shield,
  Shirt,
  Sparkles,
  Star,
  Trophy,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type { Product } from '@/core/domain/entities';
import { cn, hashString } from '@/lib/utils';

const GLYPHS: Record<string, LucideIcon> = {
  zap: Zap,
  sparkles: Sparkles,
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

const CATEGORY_GLYPH: Record<string, string> = {
  'pokemon-tcg': 'zap',
  consoles: 'gamepad',
  'consoles-limitados': 'star',
  jogos: 'disc',
  'jogos-usados': 'recycle',
  controles: 'gamepad',
  headsets: 'headphones',
  acessorios: 'plug',
  'protecao-tcg': 'shield',
  colecionaveis: 'trophy',
  'edicoes-colecionador': 'crown',
  geek: 'shirt',
};

interface ProductVisualProps {
  product: Product;
  className?: string;
  variant?: 'card' | 'detail' | 'thumb';
  frame?: number;
  priority?: boolean;
}

/**
 * Arte procedural do produto.
 *
 * O catálogo guarda `media[].src` para fotografia real; enquanto não houver
 * imagem, esta composição gera uma peça consistente com a identidade da loja a
 * partir do matiz e da categoria do produto — determinística por slug.
 */
export function ProductVisual({
  product,
  className,
  variant = 'card',
  frame = 0,
  priority,
}: ProductVisualProps) {
  const media = product.media[frame] ?? product.media[0];

  if (media?.src) {
    return (
      <Image
        src={media.src}
        alt={product.name}
        fill
        priority={priority}
        sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 320px"
        className={cn('object-cover', className)}
      />
    );
  }

  const seed = hashString(product.slug + frame);
  const hue = product.accent;
  const Glyph = GLYPHS[CATEGORY_GLYPH[product.categorySlug] ?? 'sparkles'] ?? Sparkles;
  const isCard = product.type === 'tcg-card';
  const isDetail = variant === 'detail';
  const rotation = (seed % 7) - 3;

  const base = `hsl(${hue} 62% 9%)`;
  const mid = `hsl(${(hue + 22) % 360} 70% 16%)`;
  const beam = `hsl(${hue} 92% 66%)`;

  return (
    <div
      className={cn('absolute inset-0 overflow-hidden', className)}
      style={{ background: `linear-gradient(155deg, ${mid} 0%, ${base} 46%, #0a0a0d 100%)` }}
      aria-hidden
    >
      {/* Halo principal — gradiente já é suave, não precisa de blur() (ver Aurora).
          Isto se repete uma vez por card; numa vitrine cheia, o filtro somava
          megapixels de trabalho por quadro sem mudar o que se vê. */}
      <div
        className="absolute -left-1/4 -top-1/3 size-[130%] opacity-70"
        style={{
          background: `radial-gradient(circle at 34% 30%, ${beam}55 0%, ${beam}22 34%, transparent 66%)`,
        }}
      />
      {/* Malha técnica */}
      <div className="grid-tech absolute inset-0 opacity-[0.35] [background-size:32px_32px]" />
      {/* Faixa diagonal de luz */}
      <div
        className="absolute inset-y-0 -left-1/3 w-2/3 rotate-12 opacity-25"
        style={{ background: `linear-gradient(90deg, transparent, ${beam}44 45%, ${beam}66 50%, ${beam}44 55%, transparent)` }}
      />

      {isCard ? (
        <CardFrame product={product} beam={beam} rotation={rotation} detail={isDetail} />
      ) : (
        <DeviceFrame Glyph={Glyph} beam={beam} rotation={rotation} detail={isDetail} label={product.sku} />
      )}

      {/* Vinheta + grão */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_38%,rgba(5,5,8,0.82)_100%)]" />
      <div className="scanlines absolute inset-0 opacity-[0.18] mix-blend-overlay" />
    </div>
  );
}

function CardFrame({
  product,
  beam,
  rotation,
  detail,
}: {
  product: Product;
  beam: string;
  rotation: number;
  detail: boolean;
}) {
  const card = product.card;

  return (
    <div className="absolute inset-0 grid place-items-center p-[8%]">
      <div
        className="relative h-full w-[74%] rounded-[6%/4%] border shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)]"
        style={{
          transform: `rotate(${rotation * 0.6}deg)`,
          borderColor: `${beam}55`,
          background: `linear-gradient(168deg, ${beam}22 0%, rgba(10,10,14,0.9) 42%, rgba(6,6,9,0.96) 100%)`,
        }}
      >
        {/* Moldura interna */}
        <div className="absolute inset-[6%] rounded-[4%/3%] border border-white/10" />

        {/* Barra de nome */}
        <div className="absolute inset-x-[10%] top-[10%] flex items-center justify-between gap-2">
          <span className="truncate font-display text-[0.5rem] font-bold uppercase tracking-wider text-white/85 sm:text-[0.6rem]">
            {product.name}
          </span>
          {card?.hp ? (
            <span className="shrink-0 font-tech text-[0.5rem] font-bold text-white/70 sm:text-[0.55rem]">
              {card.hp} HP
            </span>
          ) : null}
        </div>

        {/* Janela de arte */}
        <div
          className="absolute inset-x-[10%] top-[20%] h-[46%] overflow-hidden rounded-[3%] border border-white/10"
          style={{ background: `radial-gradient(circle at 50% 35%, ${beam}44, rgba(4,4,7,0.95) 72%)` }}
        >
          <div
            className="absolute inset-0 opacity-60 mix-blend-screen"
            style={{
              backgroundImage: `repeating-conic-gradient(from 0deg at 50% 50%, ${beam}00 0deg, ${beam}33 12deg, ${beam}00 24deg)`,
            }}
          />
          <div className="absolute inset-0 grid place-items-center">
            <Sparkles className="size-1/3 text-white/25" strokeWidth={1} />
          </div>
        </div>

        {/* Rodapé técnico */}
        <div className="absolute inset-x-[10%] bottom-[9%] flex items-end justify-between font-tech text-[0.45rem] uppercase tracking-widest text-white/45 sm:text-[0.5rem]">
          <span className="truncate">{card?.setCode ?? product.categorySlug}</span>
          <span>{card?.number ?? product.sku.slice(-4)}</span>
        </div>

        {detail ? (
          <div
            className="absolute inset-0 rounded-[6%/4%] opacity-40 mix-blend-color-dodge"
            style={{
              background: `linear-gradient(115deg, transparent 30%, ${beam}55 46%, transparent 62%)`,
            }}
          />
        ) : null}
      </div>
    </div>
  );
}

function DeviceFrame({
  Glyph,
  beam,
  rotation,
  detail,
  label,
}: {
  Glyph: LucideIcon;
  beam: string;
  rotation: number;
  detail: boolean;
  label: string;
}) {
  return (
    <div className="absolute inset-0 grid place-items-center">
      {/* Silhueta atrás do emblema */}
      <div
        className="absolute size-[58%] rounded-[28%] border opacity-40 blur-[1px]"
        style={{ borderColor: `${beam}44`, transform: `rotate(${rotation * 2}deg)` }}
      />
      <div
        className="absolute size-[42%] rounded-[26%] opacity-70"
        style={{
          background: `linear-gradient(150deg, ${beam}33, transparent 70%)`,
          transform: `rotate(${-rotation * 1.4}deg)`,
        }}
      />

      <Glyph
        className="relative size-[34%] text-white/85"
        strokeWidth={1.1}
        style={{ filter: `drop-shadow(0 0 26px ${beam}aa)` }}
      />

      {detail ? (
        <span className="absolute bottom-[8%] font-tech text-2xs uppercase tracking-[0.4em] text-white/35">
          {label}
        </span>
      ) : null}
    </div>
  );
}
