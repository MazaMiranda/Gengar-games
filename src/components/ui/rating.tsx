import { Star } from '@phosphor-icons/react/dist/ssr';
import { cn } from '@/lib/utils';

interface RatingProps {
  value: number;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

const SIZES = { sm: 'size-3', md: 'size-3.5', lg: 'size-4' } as const;

export function Rating({ value, count, size = 'sm', showValue = true, className }: RatingProps) {
  const percent = Math.max(0, Math.min(100, (value / 5) * 100));

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative inline-flex">
        <div className="text-ink-ghost flex gap-0.5">
          {Array.from({ length: 5 }, (_, index) => (
            <Star key={index} className={SIZES[size]} weight="regular" />
          ))}
        </div>
        <div
          className="text-warning absolute inset-0 flex gap-0.5 overflow-hidden"
          style={{ width: `${percent}%` }}
          aria-hidden
        >
          {/* No Lucide o preenchimento vinha de `fill-current` sobre um traço.
              O Phosphor não tem traço: o glifo já é um path preenchido com
              currentColor, e quem decide cheio ou vazado é o `weight`. Mantido
              como estava, a camada da nota virava outra estrela vazada e a
              avaliação deixava de ser legível. */}
          {Array.from({ length: 5 }, (_, index) => (
            <Star key={index} className={cn(SIZES[size], 'shrink-0')} weight="fill" />
          ))}
        </div>
      </div>
      {showValue ? (
        <span className="font-tech text-2xs text-ink-muted font-semibold tabular-nums">
          {value.toFixed(1)}
        </span>
      ) : null}
      {count !== undefined ? <span className="text-2xs text-ink-faint">({count})</span> : null}
      <span className="sr-only">
        Nota {value.toFixed(1)} de 5{count !== undefined ? `, ${count} avaliações` : ''}
      </span>
    </div>
  );
}
