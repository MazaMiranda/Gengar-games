import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  /*
   * Caixa normal.
   *
   * Era `font-tech uppercase tracking-[0.16em]`. Funciona para um selo de uma
   * palavra, mas o Badge também carrega frase — "Conferida sob luz UV",
   * "Enviada em toploader" — e frase inteira em caixa alta com tracking vira
   * grito, além de ficar mais lenta de ler: caixa alta apaga a silhueta da
   * palavra. A cor e o anel já separam o selo do texto ao redor; a tipografia
   * não precisava fazer o mesmo trabalho de novo.
   */
  'inline-flex items-center gap-1.5 font-medium transition-colors',
  {
    variants: {
      variant: {
        brand: 'bg-brand-500/15 text-brand-200 ring-1 ring-brand-400/30',
        solid: 'bg-brand-500 text-white shadow-glow-sm',
        neutral: 'bg-ink/6 text-ink-muted ring-1 ring-line',
        success: 'bg-success/12 text-success ring-1 ring-success/25',
        warning: 'bg-warning/12 text-warning ring-1 ring-warning/25',
        danger: 'bg-danger/14 text-danger ring-1 ring-danger/30',
        info: 'bg-info/12 text-info ring-1 ring-info/25',
        outline: 'text-ink-muted ring-1 ring-line-strong',
      },
      size: {
        /* Sem caixa alta o glifo fica menor na mesma medida, então cada degrau
           sobe um ponto e ganha respiro lateral para o selo não apertar. */
        sm: 'h-5 rounded-xs px-2 text-[0.6875rem]',
        md: 'h-6 rounded-sm px-2.5 text-xs',
        lg: 'h-7 rounded-md px-3 text-xs',
      },
    },
    defaultVariants: { variant: 'brand', size: 'md' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { badgeVariants };
