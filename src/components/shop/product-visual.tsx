import Image from 'next/image';
import {
  CrownIcon,
  DiscIcon,
  GameControllerIcon,
  HeadphonesIcon,
  PlugIcon,
  RecycleIcon,
  ShieldCheckIcon,
  SparkleIcon,
  StarFourIcon,
  TrophyIcon,
  TShirtIcon,
  LightningIcon,
} from '@phosphor-icons/react/dist/ssr';
import type { Icon } from '@phosphor-icons/react/lib';
import type { Product } from '@/core/domain/entities';
import { cn, hashString } from '@/lib/utils';

/*
 * Phosphor Icons, peso duotone — glifo com duas camadas de opacidade em vez
 * da linha única do Lucide. Mais detalhe, lê melhor como "peça desenhada"
 * na ficha de produto sem foto (https://phosphoricons.com, MIT).
 */
const GLYPHS: Record<string, Icon> = {
  zap: LightningIcon,
  sparkles: SparkleIcon,
  gamepad: GameControllerIcon,
  disc: DiscIcon,
  recycle: RecycleIcon,
  headphones: HeadphonesIcon,
  plug: PlugIcon,
  shield: ShieldCheckIcon,
  trophy: TrophyIcon,
  crown: CrownIcon,
  star: StarFourIcon,
  shirt: TShirtIcon,
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
    /*
     * Carta na visão de detalhe: a foto real da TCGdex é retrato (~5:7), não
     * quadrada — encaixar em container quadrado com object-cover cortava o
     * topo e o rodapé da carta (nome, HP, rodapé técnico ficavam de fora).
     * object-contain mostra a carta inteira; nos outros contextos (grade,
     * vitrine) o corte preenchido continua correto, é o recorte esperado de
     * card de catálogo.
     */
    const isCardDetail = product.type === 'tcg-card' && variant === 'detail';
    return (
      <Image
        src={media.src}
        alt={product.name}
        fill
        priority={priority}
        sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 320px"
        className={cn(isCardDetail ? 'object-contain' : 'object-cover', className)}
      />
    );
  }

  const seed = hashString(product.slug + frame);
  const hue = product.accent;
  const Glyph = GLYPHS[CATEGORY_GLYPH[product.categorySlug] ?? 'sparkles'] ?? SparkleIcon;
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
        className="absolute -top-1/3 -left-1/4 size-[130%] opacity-70"
        style={{
          background: `radial-gradient(circle at 34% 30%, ${beam}55 0%, ${beam}22 34%, transparent 66%)`,
        }}
      />
      {/* Malha técnica */}
      <div className="grid-tech absolute inset-0 [background-size:32px_32px] opacity-[0.35]" />
      {/* Faixa diagonal de luz */}
      <div
        className="absolute inset-y-0 -left-1/3 w-2/3 rotate-12 opacity-25"
        style={{
          background: `linear-gradient(90deg, transparent, ${beam}44 45%, ${beam}66 50%, ${beam}44 55%, transparent)`,
        }}
      />

      {isCard ? (
        <CardFrame product={product} beam={beam} rotation={rotation} detail={isDetail} />
      ) : (
        <DeviceFrame
          product={product}
          Glyph={Glyph}
          beam={beam}
          rotation={rotation}
          detail={isDetail}
        />
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
        <div className="border-ink/10 absolute inset-[6%] rounded-[4%/3%] border" />

        {/* Barra de nome */}
        <div className="absolute inset-x-[10%] top-[10%] flex items-center justify-between gap-2">
          <span className="font-display truncate text-[0.5rem] font-bold tracking-wider text-white/85 uppercase sm:text-[0.6rem]">
            {product.name}
          </span>
          {card?.hp ? (
            <span className="font-tech shrink-0 text-[0.5rem] font-bold text-white/70 sm:text-[0.55rem]">
              {card.hp} HP
            </span>
          ) : null}
        </div>

        {/* Janela de arte */}
        <div
          className="border-ink/10 absolute inset-x-[10%] top-[20%] h-[46%] overflow-hidden rounded-[3%] border"
          style={{
            background: `radial-gradient(circle at 50% 35%, ${beam}44, rgba(4,4,7,0.95) 72%)`,
          }}
        >
          <div
            className="absolute inset-0 opacity-60 mix-blend-screen"
            style={{
              backgroundImage: `repeating-conic-gradient(from 0deg at 50% 50%, ${beam}00 0deg, ${beam}33 12deg, ${beam}00 24deg)`,
            }}
          />
          <div className="absolute inset-0 grid place-items-center">
            <SparkleIcon className="size-1/3 text-white/25" weight="duotone" />
          </div>
        </div>

        {/* Rodapé técnico */}
        {/* /75 e não /45: a 8px sobre a arte escura da carta o rodapé media
            2,85:1 — o código da coleção e a numeração são informação, não
            textura, e é por eles que o colecionador identifica a carta. */}
        <div className="font-tech absolute inset-x-[10%] bottom-[9%] flex items-end justify-between text-[0.45rem] tracking-widest text-white/75 uppercase sm:text-[0.5rem]">
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

const CATEGORY_LABEL: Record<string, string> = {
  'pokemon-tcg': 'Pokémon TCG',
  consoles: 'Console',
  'consoles-limitados': 'Edição limitada',
  jogos: 'Jogo',
  'jogos-usados': 'Jogo usado',
  controles: 'Controle',
  headsets: 'Headset',
  acessorios: 'Acessório',
  'protecao-tcg': 'Proteção TCG',
  colecionaveis: 'Colecionável',
  'edicoes-colecionador': 'Edição de colecionador',
  geek: 'Cultura geek',
};

/**
 * Sem foto real, a peça vira uma ficha com dado de verdade — nome do
 * produto, categoria e SKU em tipografia de cert-label — em vez de um
 * glifo mudo boiando no gradiente. A mesma informação que já sustenta o
 * CardFrame das cartas; sem ela, todo produto de uma categoria parecia o
 * mesmo ícone repetido.
 */
function DeviceFrame({
  product,
  Glyph,
  beam,
  rotation,
  detail,
}: {
  product: Product;
  Glyph: Icon;
  beam: string;
  rotation: number;
  detail: boolean;
}) {
  const category = CATEGORY_LABEL[product.categorySlug] ?? product.categorySlug;

  return (
    <div className="absolute inset-0 grid place-items-center p-[10%]">
      <div
        className="relative flex h-full w-full max-w-[86%] flex-col items-center justify-center gap-[6%] rounded-[8%] border"
        style={{
          transform: `rotate(${rotation * 0.4}deg)`,
          borderColor: `${beam}3d`,
          background: `linear-gradient(165deg, ${beam}14 0%, rgba(10,10,14,0.72) 48%, rgba(6,6,9,0.9) 100%)`,
        }}
      >
        {/* Emblema — silhueta + glifo, mesma linguagem de antes */}
        <div className="relative grid place-items-center">
          <div
            className="absolute size-[220%] rounded-full border opacity-40 blur-[1px]"
            style={{ borderColor: `${beam}44`, transform: `rotate(${rotation * 2}deg)` }}
          />
          <div
            className="absolute size-[170%] rounded-full opacity-70"
            style={{
              background: `linear-gradient(150deg, ${beam}33, transparent 70%)`,
              transform: `rotate(${-rotation * 1.4}deg)`,
            }}
          />
          <Glyph
            className="relative size-[2.6rem] text-white/85 sm:size-[3.2rem]"
            weight="duotone"
            style={{ filter: `drop-shadow(0 0 22px ${beam}aa)` }}
          />
        </div>

        {/*
          Só a categoria — o nome já aparece na legenda que acompanha a
          imagem em todo lugar que essa ficha renderiza (card, vitrine,
          galeria), repeti-lo aqui era redundante.
        */}
        <span className="font-tech text-[0.5rem] tracking-[0.16em] text-white/50 uppercase sm:text-[0.55rem]">
          {category}
        </span>

        {detail ? (
          <span className="cert-label absolute bottom-[6%] text-[0.5rem]">
            Sem foto — {product.sku}
          </span>
        ) : null}
      </div>
    </div>
  );
}
