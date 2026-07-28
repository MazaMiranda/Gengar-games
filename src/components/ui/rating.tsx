import { Star } from 'lucide-react';
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
        <div className="flex gap-0.5 text-ink-ghost">
          {Array.from({ length: 5 }, (_, index) => (
            <Star key={index} className={SIZES[size]} strokeWidth={1.5} />
          ))}
        </div>
        <div
          className="absolute inset-0 flex gap-0.5 overflow-hidden text-warning"
          style={{ width: `${percent}%` }}
          aria-hidden
        >
          {Array.from({ length: 5 }, (_, index) => (
            <Star key={index} className={cn(SIZES[size], 'shrink-0 fill-current')} strokeWidth={1.5} />
          ))}
        </div>
      </div>
      {showValue ? (
        <span className="font-tech text-2xs font-semibold tabular-nums text-ink-muted">
          {value.toFixed(1)}
        </span>
      ) : null}
      {count !== undefined ? (
        <span className="text-2xs text-ink-faint">({count})</span>
      ) : null}
      <span className="sr-only">
        Nota {value.toFixed(1)} de 5{count !== undefined ? `, ${count} avaliações` : ''}
      </span>
    </div>
  );
}
