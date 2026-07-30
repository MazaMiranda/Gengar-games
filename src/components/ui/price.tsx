import { cn, discountPercent, formatPrice, installmentsFor, splitPrice } from '@/lib/utils';

interface PriceProps {
  value: number;
  compareAt?: number | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  installments?: boolean;
  /**
   * Mantém a altura da linha do preço antigo mesmo sem desconto. Numa grade,
   * é o que faz o preço de todos os cards cair na mesma linha de base.
   */
  reserveCompare?: boolean;
  className?: string;
}

const SIZE_MAP = {
  sm: { amount: 'text-base', fraction: 'text-[0.6875rem]', symbol: 'text-[0.625rem]' },
  md: { amount: 'text-xl', fraction: 'text-xs', symbol: 'text-2xs' },
  lg: { amount: 'text-3xl', fraction: 'text-sm', symbol: 'text-xs' },
  xl: { amount: 'text-5xl', fraction: 'text-lg', symbol: 'text-sm' },
} as const;

/** Composição tipográfica do preço: símbolo e centavos em escala menor. */
export function Price({
  value,
  compareAt,
  size = 'md',
  installments,
  reserveCompare,
  className,
}: PriceProps) {
  const { symbol, amount, fraction } = splitPrice(value);
  const scale = SIZE_MAP[size];
  const off = discountPercent(value, compareAt);
  const plan = installmentsFor(value);

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {compareAt && off > 0 ? (
        <span className={cn('text-ink-ghost line-through', size === 'xl' ? 'text-sm' : 'text-xs')}>
          {formatPrice(compareAt)}
        </span>
      ) : reserveCompare ? (
        <span aria-hidden className={cn('invisible', size === 'xl' ? 'text-sm' : 'text-xs')}>
          &nbsp;
        </span>
      ) : null}
      <div className="flex items-baseline gap-1 font-display font-bold tracking-tight text-ink">
        <span className={cn('font-tech font-semibold text-ink-muted', scale.symbol)}>{symbol}</span>
        <span className={cn('tabular-nums', scale.amount)}>{amount}</span>
        <span className={cn('font-tech tabular-nums text-ink-muted', scale.fraction)}>,{fraction}</span>
      </div>
      {installments ? (
        <span className={cn('text-ink-faint', size === 'xl' ? 'text-sm' : 'text-xs')}>
          em até{' '}
          <strong className="font-semibold text-ink-muted">
            {plan.count}x de {formatPrice(plan.value)}
          </strong>{' '}
          sem juros
        </span>
      ) : null}
    </div>
  );
}

export function DiscountTag({ value, compareAt, className }: { value: number; compareAt?: number | null; className?: string }) {
  const off = discountPercent(value, compareAt);
  if (!off) return null;

  return (
    <span
      className={cn(
        'inline-flex h-6 items-center rounded-xs bg-linear-to-r from-brand-500 to-brand-400 px-2 font-tech text-2xs font-bold uppercase tracking-wider text-white shadow-glow-sm',
        className,
      )}
    >
      -{off}%
    </span>
  );
}
