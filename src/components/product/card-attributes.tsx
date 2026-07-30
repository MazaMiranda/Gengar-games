import { Languages, Layers, ShieldCheck, Sparkles } from 'lucide-react';
import type { CardAttributes as CardAttrs, Product } from '@/core/domain/entities';
import { CARD_GRADES, RARITIES, TCG_GAMES } from '@/core/domain/taxonomy';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const RARITY_TONE: Record<string, string> = {
  comum: 'text-rarity-common',
  incomum: 'text-rarity-uncommon',
  rara: 'text-rarity-rare',
  'ultra-rara': 'text-rarity-ultra',
  secreta: 'text-rarity-secret',
};

/** Ficha técnica da carta — o painel que o colecionador procura primeiro. */
export function CardAttributes({ card, product }: { card: CardAttrs; product: Product }) {
  const rows = [
    { label: 'Jogo', value: TCG_GAMES[card.game].name },
    { label: 'Coleção', value: card.set },
    { label: 'Código', value: card.setCode },
    { label: 'Número', value: card.number },
    { label: 'Tipo', value: card.cardType },
    ...(card.hp ? [{ label: 'HP / ATK', value: String(card.hp) }] : []),
    { label: 'Ilustração', value: card.illustrator },
    { label: 'Acabamento', value: card.foil ? 'Foil / holográfica' : 'Comum' },
  ];

  return (
    <div className="plate flex flex-col gap-5 rounded-lg p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-ink">
          <Layers className="size-4 text-brand-300" />
          Ficha da carta
        </h3>
        <span className={cn('font-tech text-2xs font-bold uppercase tracking-[0.18em]', RARITY_TONE[card.rarity])}>
          {RARITIES[card.rarity].name}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Attribute icon={Languages} label="Idioma" value={card.language} />
        <Attribute
          icon={ShieldCheck}
          label="Estado"
          value={card.grade}
          hint={`${CARD_GRADES[card.grade].name} — ${CARD_GRADES[card.grade].description}`}
        />
        <Attribute icon={Sparkles} label="Estoque" value={`${product.stock} un.`} />
      </div>

      <dl className="grid gap-0 sm:grid-cols-2 sm:gap-x-8">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4 border-b border-line py-2.5">
            <dt className="font-tech text-2xs uppercase tracking-[0.16em] text-ink-faint">{row.label}</dt>
            <dd className="text-right text-xs font-medium text-ink">{row.value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-wrap gap-2">
        <Badge variant="neutral" size="sm">Conferida sob luz UV</Badge>
        <Badge variant="neutral" size="sm">Enviada em toploader</Badge>
        {card.foil ? <Badge variant="brand" size="sm">Holográfica</Badge> : null}
      </div>
    </div>
  );
}

function Attribute({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-md border border-line bg-white/2 p-3.5">
      <span className="flex items-center gap-1.5 font-tech text-2xs uppercase tracking-[0.16em] text-ink-faint">
        <Icon className="size-3" />
        {label}
      </span>
      <span className="text-sm font-semibold capitalize text-ink">{value}</span>
      {hint ? <span className="text-2xs leading-snug text-ink-ghost">{hint}</span> : null}
    </div>
  );
}
