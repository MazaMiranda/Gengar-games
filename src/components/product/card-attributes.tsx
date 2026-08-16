import { ShieldCheck, Sparkle, Stack, Translate } from '@phosphor-icons/react/dist/ssr';
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
        <h3 className="font-display text-ink flex items-center gap-2 text-sm font-semibold">
          <Stack className="text-brand-300 size-4" />
          Ficha da carta
        </h3>
        <span
          className={cn(
            'font-tech text-2xs font-bold tracking-[0.18em] uppercase',
            RARITY_TONE[card.rarity],
          )}
        >
          {RARITIES[card.rarity].name}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Attribute icon={Translate} label="Idioma" value={card.language} />
        <Attribute
          icon={ShieldCheck}
          label="Estado"
          value={card.grade}
          hint={`${CARD_GRADES[card.grade].name} — ${CARD_GRADES[card.grade].description}`}
        />
        <Attribute icon={Sparkle} label="Estoque" value={`${product.stock} un.`} />
      </div>

      <dl className="grid gap-0 sm:grid-cols-2 sm:gap-x-8">
        {rows.map((row) => (
          <div
            key={row.label}
            className="border-line flex items-center justify-between gap-4 border-b py-2.5"
          >
            <dt className="font-tech text-2xs text-ink-faint tracking-[0.16em] uppercase">
              {row.label}
            </dt>
            <dd className="text-ink text-right text-xs font-medium">{row.value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-wrap gap-2">
        <Badge variant="neutral" size="sm">
          Conferida sob luz UV
        </Badge>
        <Badge variant="neutral" size="sm">
          Enviada em toploader
        </Badge>
        {card.foil ? (
          <Badge variant="brand" size="sm">
            Holográfica
          </Badge>
        ) : null}
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
    <div className="border-line bg-ink/2 flex flex-col gap-1.5 rounded-md border p-3.5">
      <span className="font-tech text-2xs text-ink-faint flex items-center gap-1.5 tracking-[0.16em] uppercase">
        <Icon className="size-3" />
        {label}
      </span>
      <span className="text-ink text-sm font-semibold capitalize">{value}</span>
      {hint ? <span className="text-2xs text-ink-ghost leading-snug">{hint}</span> : null}
    </div>
  );
}
