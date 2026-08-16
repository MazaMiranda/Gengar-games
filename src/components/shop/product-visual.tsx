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
  const Glyph = GLYPHS[CATEGORY_GLYPH[product.categorySlug] ?? 'sparkles'] ?? SparkleIcon;
  const isCard = product.type === 'tcg-card';
  const isDetail = variant === 'detail';
  const rotation = (seed % 7) - 3;

  /*
   * Substituto de foto, não obra de arte.
   *
   * A versão anterior empilhava sete camadas para dizer "este produto não tem
   * foto": gradiente de fundo tirado do matiz do produto, halo radial, malha
   * técnica, faixa diagonal de luz, moldura com borda neon, círculos
   * concêntricos e vinheta preta. Três efeitos disso já bastariam para ler
   * como imagem gerada; sete, repetidos sessenta vezes numa página, eram o
   * item mais chamativo da loja — mais chamativo que os produtos.
   *
   * Além do visual, dois defeitos concretos: o matiz vinha de product.accent,
   * então cada card acendia uma cor diferente e a página perdia o acento
   * único; e o fundo era escuro cravado, então no tema claro a vitrine virava
   * uma parede de retângulos pretos.
   *
   * Agora é superfície neutra do tema com o glifo da categoria. Um placeholder
   * deve dizer "aqui entra a foto" e sair da frente.
   */
  const beam = 'var(--color-brand-500)';

  return (
    <div className={cn('bg-overlay absolute inset-0 overflow-hidden', className)} aria-hidden>
      {/* Profundidade monocromática: só o suficiente para a superfície não ser
          um retângulo chapado. Sem cor própria, sem brilho. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 90% at 50% 0%, color-mix(in srgb, var(--color-ink) 5%, transparent), transparent 72%)',
        }}
      />

      {isCard ? (
        <CardFrame product={product} beam={beam} rotation={rotation} detail={isDetail} />
      ) : (
        <DeviceFrame product={product} Glyph={Glyph} detail={isDetail} />
      )}
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
  detail,
}: {
  product: Product;
  Glyph: Icon;
  detail: boolean;
}) {
  const category = CATEGORY_LABEL[product.categorySlug] ?? product.categorySlug;

  return (
    <div className="absolute inset-0">
      {/*
        Mesa de estúdio, não emblema.
        A versão anterior desenhava moldura com borda neon, dois anéis girados e
        um drop-shadow de 22px no ícone. Aqui o objeto é tratado como peça
        fotografada: luz vinda de cima, o glifo apoiado no centro óptico e uma
        sombra elíptica no chão. É o que faz a caixa vazia ler como "aqui entra
        a foto do produto" em vez de "ícone decorativo".

        O centro óptico fica um pouco acima do centro geométrico (top-[46%]):
        centralizar pela matemática deixa a peça visualmente baixa quando existe
        sombra embaixo.
      */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, color-mix(in srgb, var(--color-ink) 3%, transparent) 0%, transparent 45%)',
        }}
      />

      {/* Sombra de chão: dá assentamento à peça. */}
      <div
        className="absolute bottom-[26%] left-1/2 h-[6%] w-[42%] -translate-x-1/2 rounded-[50%] blur-md"
        style={{ background: 'color-mix(in srgb, var(--color-ink) 14%, transparent)' }}
      />

      <div className="absolute top-[46%] left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-4">
        <Glyph className="text-ink-faint size-16 sm:size-20" weight="duotone" />
      </div>

      <span className="text-ink-faint absolute inset-x-0 bottom-[12%] text-center text-xs">
        {category}
      </span>

      {detail ? (
        <span className="cert-label absolute bottom-[4%] left-1/2 -translate-x-1/2">
          Sem foto — {product.sku}
        </span>
      ) : null}
    </div>
  );
}
