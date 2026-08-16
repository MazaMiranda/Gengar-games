import Image from 'next/image';
import {
  DiscIcon,
  GameControllerIcon,
  PlugIcon,
  SparkleIcon,
  TrophyIcon,
} from '@phosphor-icons/react/dist/ssr';
import type { Icon } from '@phosphor-icons/react/lib';
import { cn } from '@/lib/utils';
import tcgdexImages from '@/infrastructure/data/tcgdex-images.json';

const REAL_ART: Record<string, string> = tcgdexImages.cards;

const TYPE_GLYPH: Record<string, Icon> = {
  'tcg-card': SparkleIcon,
  'tcg-sealed': SparkleIcon,
  console: GameControllerIcon,
  game: DiscIcon,
  accessory: PlugIcon,
  collectible: TrophyIcon,
};

/**
 * Miniatura de linha (carrinho, resumo de checkout, recomendação) — foto
 * real da TCGdex quando existe, senão um glifo por tipo sobre o matiz do
 * produto. Substitui o monograma (primeira letra do nome num degradê) que
 * se repetia em três lugares independentes do fluxo de compra.
 */
export function LineThumb({
  slug,
  name,
  type,
  accent,
  className,
}: {
  slug: string;
  name: string;
  type: string;
  accent: number;
  className?: string;
}) {
  const real = REAL_ART[slug];
  if (real) {
    return (
      <div className={cn('relative overflow-hidden', className)}>
        <Image src={real} alt={name} fill sizes="80px" className="object-cover" />
      </div>
    );
  }

  const Glyph = TYPE_GLYPH[type] ?? SparkleIcon;
  return (
    <div
      className={cn('relative grid place-items-center overflow-hidden', className)}
      style={{
        background: `linear-gradient(150deg, hsl(${accent} 68% 20%), rgba(9,9,12,0.95))`,
      }}
    >
      <Glyph className="size-1/3 text-white/70" weight="duotone" />
    </div>
  );
}
